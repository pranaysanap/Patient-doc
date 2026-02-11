const AuditLog = require('../models/AuditLog');

/**
 * HIPAA §164.312(b) / DPDP §8 — Audit Logging Middleware
 * Automatically logs every API request that accesses or modifies PHI/PII.
 */

// Map routes to audit actions
const ROUTE_ACTION_MAP = {
    // Auth routes
    'POST /api/v1/auth/doctor/login': { action: 'LOGIN_SUCCESS', resourceType: 'auth' },
    'POST /api/v1/auth/patient/google': { action: 'LOGIN_SUCCESS', resourceType: 'auth' },
    'POST /api/v1/auth/patient/register': { action: 'PATIENT_REGISTER', resourceType: 'auth' },
    'GET /api/v1/auth/me': { action: 'PATIENT_VIEW', resourceType: 'auth' },

    // Patient routes
    'GET /api/v1/patients': { action: 'PATIENT_LIST', resourceType: 'patient', phiAccessed: true },
    'GET /api/v1/patients/pending': { action: 'PATIENT_LIST', resourceType: 'patient', phiAccessed: true },
    'PUT /api/v1/patients/:id': { action: 'PATIENT_UPDATE', resourceType: 'patient', phiAccessed: true },
    'PATCH /api/v1/patients/:id/status': { action: 'PATIENT_UPDATE', resourceType: 'patient' },
    'DELETE /api/v1/patients/:id/account': { action: 'PATIENT_DELETE', resourceType: 'patient', phiAccessed: true },
    'GET /api/v1/patients/:id/export': { action: 'PATIENT_EXPORT', resourceType: 'patient', phiAccessed: true },

    // Health metrics routes
    'POST /api/v1/health-metrics/:id': { action: 'HEALTH_METRICS_UPLOAD', resourceType: 'health_metrics', phiAccessed: true },
    'GET /api/v1/health-metrics/:id/latest': { action: 'HEALTH_METRICS_VIEW', resourceType: 'health_metrics', phiAccessed: true },
    'GET /api/v1/health-metrics/:id/history': { action: 'HEALTH_METRICS_HISTORY', resourceType: 'health_metrics', phiAccessed: true },

    // Prescription routes
    'POST /api/v1/prescriptions': { action: 'PRESCRIPTION_CREATE', resourceType: 'prescription', phiAccessed: true },
    'GET /api/v1/prescriptions/doctor': { action: 'PRESCRIPTION_LIST', resourceType: 'prescription', phiAccessed: true },
    'GET /api/v1/prescriptions/patient/:id': { action: 'PRESCRIPTION_LIST', resourceType: 'prescription', phiAccessed: true },
    'PUT /api/v1/prescriptions/:id': { action: 'PRESCRIPTION_UPDATE', resourceType: 'prescription', phiAccessed: true },
    'PATCH /api/v1/prescriptions/:id/status': { action: 'PRESCRIPTION_STATUS_CHANGE', resourceType: 'prescription' },

    // Appointment routes
    'POST /api/v1/appointments': { action: 'APPOINTMENT_CREATE', resourceType: 'appointment' },
    'GET /api/v1/appointments/doctor': { action: 'APPOINTMENT_LIST', resourceType: 'appointment' },
    'GET /api/v1/appointments/patient/:id': { action: 'APPOINTMENT_LIST', resourceType: 'appointment' },
    'PATCH /api/v1/appointments/:id/status': { action: 'APPOINTMENT_STATUS_CHANGE', resourceType: 'appointment' },
    'PUT /api/v1/appointments/:id/report': { action: 'APPOINTMENT_REPORT', resourceType: 'appointment', phiAccessed: true },
    'DELETE /api/v1/appointments/:id': { action: 'APPOINTMENT_CANCEL', resourceType: 'appointment' },

    // Consent routes
    'POST /api/v1/consent': { action: 'CONSENT_GRANTED', resourceType: 'consent' },
    'PUT /api/v1/consent': { action: 'CONSENT_UPDATED', resourceType: 'consent' },
    'POST /api/v1/consent/withdraw': { action: 'CONSENT_WITHDRAWN', resourceType: 'consent' },
};

/**
 * Normalize a request path to match against route patterns.
 * Replaces dynamic segments with `:id`.
 */
function normalizeRoute(method, path) {
    // Remove query string
    const cleanPath = path.split('?')[0];

    // Replace known ID patterns with :id
    const normalized = cleanPath
        .replace(/\/pat_[a-f0-9]+/g, '/:id')
        .replace(/\/rx_[a-f0-9]+/g, '/:id')
        .replace(/\/apt_[a-f0-9]+/g, '/:id')
        .replace(/\/dr_[a-z_]+_\d+/g, '/:id')
        .replace(/\/[a-f0-9]{24}/g, '/:id');

    return `${method} ${normalized}`;
}

/**
 * Extract the client IP address from the request.
 */
function getClientIp(req) {
    return req.headers['x-forwarded-for']?.split(',')[0]?.trim()
        || req.connection?.remoteAddress
        || req.ip
        || 'unknown';
}

/**
 * Audit logging middleware — attach to Express app AFTER auth middleware.
 * Runs after the response is sent to avoid blocking.
 */
const auditMiddleware = (req, res, next) => {
    // Store original end function
    const originalEnd = res.end;
    const startTime = Date.now();

    // Override res.end to capture response
    res.end = function (...args) {
        // Restore original
        res.end = originalEnd;
        res.end(...args);

        // Log asynchronously — don't block response
        setImmediate(async () => {
            try {
                const route = normalizeRoute(req.method, req.originalUrl || req.url);
                const mapping = ROUTE_ACTION_MAP[route];

                // Only log mapped routes (skip health checks, static files, etc.)
                if (!mapping) return;

                // Extract resource ID from params
                const resourceId = req.params?.patientId
                    || req.params?.prescriptionId
                    || req.params?.appointmentId
                    || null;

                const logEntry = {
                    userId: req.user?.id || req.user?.patientId || req.user?.doctorId || 'anonymous',
                    userRole: req.user?.role || 'anonymous',
                    userName: req.user?.name || undefined,
                    userEmail: req.user?.email || undefined,
                    action: mapping.action,
                    resourceType: mapping.resourceType,
                    resourceId: resourceId,
                    ipAddress: getClientIp(req),
                    userAgent: req.headers['user-agent'] || 'unknown',
                    method: req.method,
                    path: req.originalUrl || req.url,
                    statusCode: res.statusCode,
                    phiAccessed: mapping.phiAccessed || false,
                    complianceFlags: ['HIPAA', 'DPDP'],
                    details: {
                        responseTime: Date.now() - startTime,
                        contentLength: res.getHeader('content-length') || 0
                    }
                };

                // Log failed auth as specific action
                if (mapping.action === 'LOGIN_SUCCESS' && res.statusCode >= 400) {
                    logEntry.action = 'LOGIN_FAILURE';
                }

                // Log unauthorized access attempts
                if (res.statusCode === 403) {
                    logEntry.action = 'UNAUTHORIZED_ACCESS_ATTEMPT';
                }

                await AuditLog.create(logEntry);
            } catch (err) {
                // Never let audit logging crash the app
                console.error('[AUDIT] Failed to write audit log:', err.message);
            }
        });
    };

    next();
};

/**
 * Utility: Manually log an audit event (for use in route handlers).
 */
const logAuditEvent = async (eventData) => {
    try {
        await AuditLog.create({
            ...eventData,
            complianceFlags: eventData.complianceFlags || ['HIPAA', 'DPDP'],
            timestamp: new Date()
        });
    } catch (err) {
        console.error('[AUDIT] Failed to write manual audit log:', err.message);
    }
};

module.exports = {
    auditMiddleware,
    logAuditEvent
};
