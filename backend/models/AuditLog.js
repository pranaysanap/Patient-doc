const mongoose = require('mongoose');

/**
 * HIPAA §164.312(b) / DPDP §8 — Audit Trail
 * Logs every access, modification, and authentication event involving PHI/PII.
 * Retention: 6 years (HIPAA requirement).
 */
const auditLogSchema = new mongoose.Schema({
    // Who performed the action
    userId: {
        type: String,
        required: true,
        index: true
    },
    userRole: {
        type: String,
        enum: ['doctor', 'patient', 'system', 'anonymous'],
        required: true
    },
    userName: String,
    userEmail: String,

    // What action was performed
    action: {
        type: String,
        required: true,
        enum: [
            // Authentication events
            'LOGIN_SUCCESS',
            'LOGIN_FAILURE',
            'LOGOUT',
            'TOKEN_REFRESH',
            'PASSWORD_CHANGE',

            // Patient data events
            'PATIENT_VIEW',
            'PATIENT_LIST',
            'PATIENT_UPDATE',
            'PATIENT_DELETE',
            'PATIENT_EXPORT',
            'PATIENT_REGISTER',

            // Health data events
            'HEALTH_METRICS_VIEW',
            'HEALTH_METRICS_UPLOAD',
            'HEALTH_METRICS_HISTORY',

            // Prescription events
            'PRESCRIPTION_CREATE',
            'PRESCRIPTION_VIEW',
            'PRESCRIPTION_LIST',
            'PRESCRIPTION_UPDATE',
            'PRESCRIPTION_STATUS_CHANGE',

            // Appointment events
            'APPOINTMENT_CREATE',
            'APPOINTMENT_VIEW',
            'APPOINTMENT_LIST',
            'APPOINTMENT_STATUS_CHANGE',
            'APPOINTMENT_REPORT',
            'APPOINTMENT_CANCEL',

            // Consent events
            'CONSENT_GRANTED',
            'CONSENT_WITHDRAWN',
            'CONSENT_UPDATED',

            // Data rights events
            'DATA_EXPORT_REQUEST',
            'DATA_DELETION_REQUEST',
            'DATA_DELETION_COMPLETE',

            // Security events
            'UNAUTHORIZED_ACCESS_ATTEMPT',
            'RATE_LIMIT_EXCEEDED',
            'BREACH_DETECTED',
            'EMERGENCY_TRIGGERED'
        ],
        index: true
    },

    // What resource was accessed
    resourceType: {
        type: String,
        enum: ['patient', 'prescription', 'appointment', 'health_metrics', 'consent', 'auth', 'system'],
        index: true
    },
    resourceId: String,

    // Request metadata
    ipAddress: String,
    userAgent: String,
    method: String,
    path: String,
    statusCode: Number,

    // Additional details (never store actual PHI here — only metadata)
    details: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },

    // Compliance flags
    phiAccessed: {
        type: Boolean,
        default: false
    },
    complianceFlags: [{
        type: String,
        enum: ['HIPAA', 'DPDP', 'GDPR']
    }],

    timestamp: {
        type: Date,
        default: Date.now,
        index: true
    }
}, {
    timestamps: false, // We use our own timestamp
    // HIPAA requires 6-year retention — do NOT add TTL index
});

// Compound indexes for efficient compliance queries
auditLogSchema.index({ userId: 1, timestamp: -1 });
auditLogSchema.index({ action: 1, timestamp: -1 });
auditLogSchema.index({ resourceType: 1, resourceId: 1, timestamp: -1 });
auditLogSchema.index({ phiAccessed: 1, timestamp: -1 });

// Prevent modification of audit logs (immutability)
auditLogSchema.pre('findOneAndUpdate', function () {
    throw new Error('Audit logs are immutable and cannot be modified');
});

auditLogSchema.pre('updateOne', function () {
    throw new Error('Audit logs are immutable and cannot be modified');
});

auditLogSchema.pre('updateMany', function () {
    throw new Error('Audit logs are immutable and cannot be modified');
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
