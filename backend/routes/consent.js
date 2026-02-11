const express = require('express');
const router = express.Router();
const Consent = require('../models/Consent');
const { authMiddleware, requirePatient } = require('../middleware/auth');
const { logAuditEvent } = require('../middleware/auditLog');
const { validate } = require('../middleware/dataSanitizer');

/**
 * DPDP §5-6 / HIPAA Privacy Rule — Consent Management Routes
 */

// @route   GET /api/v1/consent
// @desc    Get current patient's consent record
// @access  Private/Patient
router.get('/', authMiddleware, async (req, res, next) => {
    try {
        const patientId = req.user.patientId || req.user.id;
        const consent = await Consent.findOne({ patientId });

        res.json({
            success: true,
            data: consent,
            hasConsent: !!consent?.hasGivenInitialConsent
        });
    } catch (error) {
        next(error);
    }
});

// @route   POST /api/v1/consent
// @desc    Grant initial consent (first-time setup)
// @access  Private/Patient
router.post('/', authMiddleware, validate('consent'), async (req, res, next) => {
    try {
        const patientId = req.user.patientId || req.user.id;
        const {
            dataCollection,
            healthDataProcessing,
            aiAnalysis,
            doctorDataSharing,
            emailNotifications,
            emergencyServices,
            fitnessData,
            privacyPolicyAccepted,
            termsAccepted,
            isMinor,
            parentGuardianName,
            parentGuardianEmail
        } = req.body;

        // Core consent is mandatory
        if (!dataCollection || !privacyPolicyAccepted || !termsAccepted) {
            return res.status(400).json({
                success: false,
                error: 'Core data collection consent, privacy policy, and terms acceptance are required to use VaidyaSetu'
            });
        }

        const now = new Date();
        const ipAddress = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip;
        const userAgent = req.headers['user-agent'];

        // Build consent record
        const consentData = {
            patientId,
            patientEmail: req.user.email,
            patientName: req.user.name,
            consents: {
                dataCollection: { granted: !!dataCollection, grantedAt: dataCollection ? now : undefined, version: '1.0' },
                healthDataProcessing: { granted: !!healthDataProcessing, grantedAt: healthDataProcessing ? now : undefined, version: '1.0' },
                aiAnalysis: { granted: !!aiAnalysis, grantedAt: aiAnalysis ? now : undefined, version: '1.0' },
                doctorDataSharing: { granted: !!doctorDataSharing, grantedAt: doctorDataSharing ? now : undefined, version: '1.0' },
                emailNotifications: { granted: !!emailNotifications, grantedAt: emailNotifications ? now : undefined, version: '1.0' },
                emergencyServices: { granted: !!emergencyServices, grantedAt: emergencyServices ? now : undefined, version: '1.0' },
                fitnessData: { granted: !!fitnessData, grantedAt: fitnessData ? now : undefined, version: '1.0' }
            },
            privacyPolicyVersion: '1.0',
            privacyPolicyAcceptedAt: now,
            termsVersion: '1.0',
            termsAcceptedAt: now,
            isMinor: !!isMinor,
            parentalConsentGiven: isMinor ? !!(parentGuardianName && parentGuardianEmail) : false,
            parentGuardianName: parentGuardianName || undefined,
            parentGuardianEmail: parentGuardianEmail || undefined,
            hasGivenInitialConsent: true,
            history: [{
                action: 'granted',
                purpose: 'initial_consent',
                timestamp: now,
                ipAddress,
                userAgent,
                version: '1.0'
            }]
        };

        // Upsert consent record
        const consent = await Consent.findOneAndUpdate(
            { patientId },
            consentData,
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        // Audit log
        await logAuditEvent({
            userId: patientId,
            userRole: 'patient',
            action: 'CONSENT_GRANTED',
            resourceType: 'consent',
            resourceId: consent._id.toString(),
            ipAddress,
            userAgent,
            details: {
                purposes: Object.entries(consentData.consents)
                    .filter(([_, v]) => v.granted)
                    .map(([k]) => k)
            }
        });

        res.status(201).json({
            success: true,
            data: consent,
            message: 'Consent recorded successfully'
        });
    } catch (error) {
        next(error);
    }
});

// @route   PUT /api/v1/consent
// @desc    Update consent preferences
// @access  Private/Patient
router.put('/', authMiddleware, validate('consent'), async (req, res, next) => {
    try {
        const patientId = req.user.patientId || req.user.id;
        const consent = await Consent.findOne({ patientId });

        if (!consent) {
            return res.status(404).json({
                success: false,
                error: 'No consent record found. Please complete initial consent first.'
            });
        }

        const now = new Date();
        const ipAddress = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip;
        const userAgent = req.headers['user-agent'];
        const changes = [];

        // Update each consent purpose if provided
        const purposes = [
            'dataCollection', 'healthDataProcessing', 'aiAnalysis',
            'doctorDataSharing', 'emailNotifications', 'emergencyServices', 'fitnessData'
        ];

        for (const purpose of purposes) {
            if (req.body[purpose] !== undefined) {
                const newValue = !!req.body[purpose];
                const oldValue = consent.consents[purpose]?.granted || false;

                if (newValue !== oldValue) {
                    consent.consents[purpose].granted = newValue;
                    if (newValue) {
                        consent.consents[purpose].grantedAt = now;
                        consent.consents[purpose].withdrawnAt = undefined;
                    } else {
                        consent.consents[purpose].withdrawnAt = now;
                    }

                    changes.push({
                        purpose,
                        from: oldValue,
                        to: newValue
                    });

                    consent.history.push({
                        action: newValue ? 'granted' : 'withdrawn',
                        purpose,
                        timestamp: now,
                        ipAddress,
                        userAgent,
                        version: consent.consents[purpose].version
                    });
                }
            }
        }

        // Core consent cannot be withdrawn (must delete account instead)
        if (req.body.dataCollection === false) {
            return res.status(400).json({
                success: false,
                error: 'Core data collection consent cannot be withdrawn. To stop all data processing, please delete your account.'
            });
        }

        await consent.save();

        // Audit log
        await logAuditEvent({
            userId: patientId,
            userRole: 'patient',
            action: 'CONSENT_UPDATED',
            resourceType: 'consent',
            resourceId: consent._id.toString(),
            ipAddress,
            userAgent,
            details: { changes }
        });

        res.json({
            success: true,
            data: consent,
            changes,
            message: `${changes.length} consent preference(s) updated`
        });
    } catch (error) {
        next(error);
    }
});

// @route   POST /api/v1/consent/withdraw
// @desc    Withdraw all consents (triggers data deletion flow)
// @access  Private/Patient
router.post('/withdraw', authMiddleware, async (req, res, next) => {
    try {
        const patientId = req.user.patientId || req.user.id;
        const consent = await Consent.findOne({ patientId });

        if (!consent) {
            return res.status(404).json({
                success: false,
                error: 'No consent record found'
            });
        }

        const now = new Date();
        const ipAddress = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip;
        const userAgent = req.headers['user-agent'];

        // Withdraw all consents
        const purposes = Object.keys(consent.consents);
        for (const purpose of purposes) {
            if (consent.consents[purpose]?.granted) {
                consent.consents[purpose].granted = false;
                consent.consents[purpose].withdrawnAt = now;

                consent.history.push({
                    action: 'withdrawn',
                    purpose,
                    timestamp: now,
                    ipAddress,
                    userAgent,
                    version: consent.consents[purpose].version
                });
            }
        }

        consent.hasGivenInitialConsent = false;
        await consent.save();

        // Audit log
        await logAuditEvent({
            userId: patientId,
            userRole: 'patient',
            action: 'CONSENT_WITHDRAWN',
            resourceType: 'consent',
            resourceId: consent._id.toString(),
            ipAddress,
            userAgent,
            details: { allConsentsWithdrawn: true }
        });

        res.json({
            success: true,
            message: 'All consents withdrawn. Your data will be scheduled for deletion within 30 days as per our data retention policy.'
        });
    } catch (error) {
        next(error);
    }
});

// @route   GET /api/v1/consent/history
// @desc    Get consent change history (for transparency)
// @access  Private/Patient
router.get('/history', authMiddleware, async (req, res, next) => {
    try {
        const patientId = req.user.patientId || req.user.id;
        const consent = await Consent.findOne({ patientId });

        if (!consent) {
            return res.json({
                success: true,
                data: []
            });
        }

        res.json({
            success: true,
            data: consent.history.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
