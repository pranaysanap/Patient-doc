const express = require('express');
const router = express.Router();
const SecurityIncident = require('../models/SecurityIncident');
const { authMiddleware, requireDoctor } = require('../middleware/auth');
const { logAuditEvent } = require('../middleware/auditLog');
const crypto = require('crypto');

/**
 * HIPAA §164.404 / DPDP §8(6) — Compliance, Breach Notification & Privacy Routes
 */

// @route   GET /api/v1/compliance/privacy-policy
// @desc    Get current privacy policy
// @access  Public
router.get('/privacy-policy', (req, res) => {
    res.json({
        success: true,
        data: {
            version: '1.0',
            effectiveDate: '2025-01-01',
            lastUpdated: '2025-01-01',
            dataController: {
                name: 'VaidyaSetu Healthcare Platform',
                contact: process.env.DOCTOR_EMAIL || 'privacy@vaidyasetu.com',
                address: 'India'
            },
            dataProtectionOfficer: {
                name: 'Dr. Sujal Jadhav',
                email: process.env.DOCTOR_EMAIL || 'dpo@vaidyasetu.com'
            },
            applicableLaws: ['Digital Personal Data Protection Act, 2023 (India)', 'HIPAA (if US patients)'],
            dataCollected: [
                { category: 'Identity Data', examples: 'Name, email, Google profile picture', purpose: 'Account creation and authentication', legalBasis: 'Consent (DPDP §5)' },
                { category: 'Health Data', examples: 'Vitals, heart rate, blood pressure, symptoms', purpose: 'Health monitoring and doctor consultations', legalBasis: 'Explicit consent (DPDP §5, HIPAA Authorization)' },
                { category: 'Medical Records', examples: 'Prescriptions, diagnoses, medical history', purpose: 'Treatment and care continuity', legalBasis: 'Consent + Legitimate medical purpose' },
                { category: 'Fitness Data', examples: 'Steps, calories, sleep score, activity', purpose: 'Wellness tracking and AI recommendations', legalBasis: 'Consent (DPDP §5)' },
                { category: 'Location Data', examples: 'GPS coordinates (for hospital finder)', purpose: 'Nearby hospital/pharmacy locator', legalBasis: 'Consent (DPDP §5)' },
                { category: 'Communication Data', examples: 'Appointment notes, chat messages', purpose: 'Doctor-patient communication', legalBasis: 'Consent + Treatment purpose' }
            ],
            thirdPartyProcessors: [
                { name: 'Google (Gemini AI)', purpose: 'AI-powered health analysis and virtual consultations', dataShared: 'Anonymized symptoms and health queries' },
                { name: 'Google (OAuth)', purpose: 'Authentication', dataShared: 'Email, name, profile picture' },
                { name: 'Google (Fit API)', purpose: 'Fitness and wearable data sync', dataShared: 'Activity, heart rate, sleep data' },
                { name: 'MongoDB Atlas', purpose: 'Database hosting', dataShared: 'All stored data (encrypted at rest)' },
                { name: 'Twilio', purpose: 'Emergency call/SMS services', dataShared: 'Phone number, emergency context' },
                { name: 'Nodemailer (Gmail SMTP)', purpose: 'Appointment emails', dataShared: 'Email address, appointment details' }
            ],
            dataRetention: {
                patientData: '3 years after last activity, or until account deletion request',
                healthMetrics: '3 years from collection date',
                prescriptions: '6 years (regulatory requirement)',
                auditLogs: '6 years (HIPAA requirement)',
                consentRecords: 'Retained indefinitely for compliance evidence'
            },
            patientRights: [
                { right: 'Right to Access', description: 'Request a copy of all your personal data', endpoint: 'GET /api/v1/data-rights/export' },
                { right: 'Right to Portability', description: 'Export your data in machine-readable format (JSON)', endpoint: 'GET /api/v1/data-rights/export' },
                { right: 'Right to Erasure', description: 'Request deletion of your account and personal data', endpoint: 'DELETE /api/v1/data-rights/delete-account' },
                { right: 'Right to Withdraw Consent', description: 'Withdraw specific or all consents at any time', endpoint: 'POST /api/v1/consent/withdraw' },
                { right: 'Right to Rectification', description: 'Correct inaccurate personal data', endpoint: 'PUT /api/v1/patients/:patientId' },
                { right: 'Right to be Informed', description: 'Access this privacy policy and consent history', endpoint: 'GET /api/v1/consent/history' }
            ],
            securityMeasures: [
                'JWT-based authentication with httpOnly cookies',
                'Role-based access control (RBAC)',
                'Input validation and sanitization (Joi)',
                'Rate limiting (100 requests per 15 minutes)',
                'CORS origin restriction',
                'Helmet security headers (HSTS, CSP, X-Frame-Options)',
                'MongoDB encryption at rest (AES-256)',
                'Comprehensive audit logging',
                'Automated breach detection and notification'
            ],
            breachNotification: {
                dpdp: 'Data Protection Board of India notified within 72 hours',
                hipaa: 'HHS notified within 60 days; affected individuals notified without unreasonable delay',
                contact: process.env.DOCTOR_EMAIL || 'security@vaidyasetu.com'
            }
        }
    });
});

// @route   GET /api/v1/compliance/terms
// @desc    Get current terms of service
// @access  Public
router.get('/terms', (req, res) => {
    res.json({
        success: true,
        data: {
            version: '1.0',
            effectiveDate: '2025-01-01',
            platform: 'VaidyaSetu Healthcare Platform',
            summary: [
                'VaidyaSetu provides AI-powered healthcare tools for informational purposes.',
                'AI recommendations do not constitute medical advice — always consult your doctor.',
                'You must provide accurate health information for effective care.',
                'Your data is processed only with your explicit consent.',
                'You may withdraw consent or delete your account at any time.',
                'Emergency SOS services attempt to contact emergency services but do not guarantee response.',
                'The platform is not a substitute for in-person medical examination.',
                'We comply with DPDP Act 2023 (India) and HIPAA (US) where applicable.'
            ],
            disclaimer: 'VaidyaSetu is a health technology platform, not a licensed medical provider. AI-generated content is for informational purposes only and should not be used as a substitute for professional medical advice, diagnosis, or treatment.'
        }
    });
});

// @route   POST /api/v1/compliance/incidents
// @desc    Report a security incident (doctor only)
// @access  Private/Doctor
router.post('/incidents', authMiddleware, requireDoctor, async (req, res, next) => {
    try {
        const { type, severity, title, description, affectedPatientIds, affectedDataTypes, estimatedRecordsAffected } = req.body;

        const incidentId = 'INC_' + crypto.randomBytes(6).toString('hex').toUpperCase();

        const incident = await SecurityIncident.create({
            incidentId,
            type,
            severity,
            title,
            description,
            affectedPatientIds: affectedPatientIds || [],
            affectedDataTypes: affectedDataTypes || [],
            estimatedRecordsAffected: estimatedRecordsAffected || 0,
            reportedBy: req.user.doctorId,
            reportedByRole: 'doctor'
        });

        // Audit log
        await logAuditEvent({
            userId: req.user.doctorId,
            userRole: 'doctor',
            action: 'BREACH_DETECTED',
            resourceType: 'system',
            resourceId: incidentId,
            ipAddress: req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip,
            userAgent: req.headers['user-agent'],
            details: { severity, type, estimatedRecordsAffected }
        });

        res.status(201).json({
            success: true,
            data: incident,
            message: `Incident ${incidentId} reported. Notification deadline: ${incident.notificationDeadline?.toISOString()}`
        });
    } catch (error) {
        next(error);
    }
});

// @route   GET /api/v1/compliance/incidents
// @desc    List all security incidents (doctor only)
// @access  Private/Doctor
router.get('/incidents', authMiddleware, requireDoctor, async (req, res, next) => {
    try {
        const { status, severity } = req.query;
        const query = {};
        if (status) query.status = status;
        if (severity) query.severity = severity;

        const incidents = await SecurityIncident.find(query).sort({ discoveredAt: -1 });

        res.json({
            success: true,
            count: incidents.length,
            data: incidents
        });
    } catch (error) {
        next(error);
    }
});

// @route   PATCH /api/v1/compliance/incidents/:incidentId
// @desc    Update incident status (doctor only)
// @access  Private/Doctor
router.patch('/incidents/:incidentId', authMiddleware, requireDoctor, async (req, res, next) => {
    try {
        const { status, actionTaken, rootCause, preventiveMeasures } = req.body;

        const updateFields = {};
        if (status) updateFields.status = status;
        if (rootCause) updateFields.rootCause = rootCause;
        if (preventiveMeasures) updateFields.preventiveMeasures = preventiveMeasures;

        if (status === 'contained') updateFields.containedAt = new Date();
        if (status === 'resolved') updateFields.resolvedAt = new Date();
        if (status === 'reported') updateFields.reportedToAuthorityAt = new Date();

        const pushFields = {};
        if (actionTaken) {
            pushFields.actionsTaken = {
                action: actionTaken,
                takenBy: req.user.doctorId,
                timestamp: new Date()
            };
        }

        const incident = await SecurityIncident.findOneAndUpdate(
            { incidentId: req.params.incidentId },
            { $set: updateFields, ...(Object.keys(pushFields).length > 0 && { $push: pushFields }) },
            { new: true }
        );

        if (!incident) {
            return res.status(404).json({
                success: false,
                error: 'Incident not found'
            });
        }

        res.json({
            success: true,
            data: incident
        });
    } catch (error) {
        next(error);
    }
});

// @route   GET /api/v1/compliance/dashboard
// @desc    Compliance dashboard summary (doctor only)
// @access  Private/Doctor
router.get('/dashboard', authMiddleware, requireDoctor, async (req, res, next) => {
    try {
        const AuditLog = require('../models/AuditLog');
        const Consent = require('../models/Consent');
        const Patient = require('../models/Patient');

        const [
            totalPatients,
            patientsWithConsent,
            openIncidents,
            recentAuditLogs,
            phiAccessCount,
            unauthorizedAttempts
        ] = await Promise.all([
            Patient.countDocuments({}),
            Consent.countDocuments({ hasGivenInitialConsent: true }),
            SecurityIncident.countDocuments({ status: { $nin: ['resolved'] } }),
            AuditLog.countDocuments({ timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } }),
            AuditLog.countDocuments({ phiAccessed: true, timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } }),
            AuditLog.countDocuments({ action: 'UNAUTHORIZED_ACCESS_ATTEMPT', timestamp: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } })
        ]);

        res.json({
            success: true,
            data: {
                consentCompliance: {
                    totalPatients,
                    patientsWithConsent,
                    consentRate: totalPatients > 0 ? ((patientsWithConsent / totalPatients) * 100).toFixed(1) + '%' : 'N/A'
                },
                security: {
                    openIncidents,
                    unauthorizedAttemptsLast7Days: unauthorizedAttempts
                },
                auditActivity: {
                    totalLast24Hours: recentAuditLogs,
                    phiAccessLast24Hours: phiAccessCount
                },
                complianceFrameworks: ['DPDP Act 2023', 'HIPAA'],
                lastReviewDate: new Date().toISOString()
            }
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
