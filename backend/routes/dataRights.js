const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');
const Prescription = require('../models/Prescription');
const Appointment = require('../models/Appointment');
const HealthMetrics = require('../models/HealthMetrics');
const Consent = require('../models/Consent');
const AuditLog = require('../models/AuditLog');
const { authMiddleware, requirePatient, requireDoctor } = require('../middleware/auth');
const { logAuditEvent } = require('../middleware/auditLog');

/**
 * DPDP §12 / HIPAA — Data Subject Rights Routes
 * Right to Access, Right to Portability, Right to Erasure
 */

// @route   GET /api/v1/data-rights/export
// @desc    Export all patient data (Right to Portability — DPDP §12)
// @access  Private/Patient
router.get('/export', authMiddleware, async (req, res, next) => {
    try {
        const patientId = req.user.patientId || req.user.id;
        const ipAddress = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip;

        // Fetch all patient data
        const [patient, prescriptions, appointments, healthMetrics, consent] = await Promise.all([
            Patient.findOne({ patientId }).select('-__v'),
            Prescription.find({ patientId }).select('-__v').lean(),
            Appointment.find({ patientId }).select('-__v').lean(),
            HealthMetrics.find({ patientId }).select('-__v').lean(),
            Consent.findOne({ patientId }).select('-__v -history').lean()
        ]);

        if (!patient) {
            return res.status(404).json({
                success: false,
                error: 'Patient record not found'
            });
        }

        // Build comprehensive export
        const exportData = {
            exportMetadata: {
                exportDate: new Date().toISOString(),
                format: 'JSON',
                standard: 'VaidyaSetu Patient Data Export v1.0',
                complianceFrameworks: ['DPDP-2023', 'HIPAA'],
                dataController: 'VaidyaSetu Healthcare Platform',
                patientId: patientId,
                note: 'This export contains all personal and health data associated with your account.'
            },
            personalInformation: {
                patientId: patient.patientId,
                name: patient.personalInfo?.name,
                email: patient.personalInfo?.email,
                phone: patient.personalInfo?.phone,
                age: patient.personalInfo?.age,
                gender: patient.personalInfo?.gender,
                bloodGroup: patient.personalInfo?.bloodGroup,
                dateOfBirth: patient.personalInfo?.dateOfBirth,
                registeredAt: patient.createdAt,
                lastLogin: patient.lastLogin
            },
            medicalInformation: {
                allergies: patient.medicalInfo?.allergies || [],
                chronicConditions: patient.medicalInfo?.chronicConditions || [],
                currentMedications: patient.medicalInfo?.currentMedications || [],
                emergencyContact: patient.medicalInfo?.emergencyContact || {},
                riskLevel: patient.riskLevel
            },
            prescriptions: prescriptions.map(rx => ({
                prescriptionId: rx.prescriptionId,
                doctorName: rx.doctorName,
                diagnosis: rx.diagnosis,
                medicines: rx.medicines,
                instructions: rx.instructions,
                status: rx.status,
                issuedDate: rx.issuedDate,
                expiryDate: rx.expiryDate
            })),
            appointments: appointments.map(apt => ({
                appointmentId: apt.appointmentId,
                date: apt.appointmentDate,
                type: apt.type,
                status: apt.status,
                purpose: apt.purpose,
                notes: apt.notes,
                consultationReport: apt.consultationReport
            })),
            healthMetrics: healthMetrics.map(hm => ({
                date: hm.date,
                vitals: hm.vitals,
                activity: hm.activity,
                recordedAt: hm.timestamp
            })),
            consentRecord: consent ? {
                consents: consent.consents,
                privacyPolicyVersion: consent.privacyPolicyVersion,
                privacyPolicyAcceptedAt: consent.privacyPolicyAcceptedAt,
                termsVersion: consent.termsVersion,
                termsAcceptedAt: consent.termsAcceptedAt
            } : null
        };

        // Audit log
        await logAuditEvent({
            userId: patientId,
            userRole: 'patient',
            action: 'DATA_EXPORT_REQUEST',
            resourceType: 'patient',
            resourceId: patientId,
            ipAddress,
            userAgent: req.headers['user-agent'],
            phiAccessed: true,
            details: {
                recordCounts: {
                    prescriptions: prescriptions.length,
                    appointments: appointments.length,
                    healthMetrics: healthMetrics.length
                }
            }
        });

        // Set download headers
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="vaidyasetu_data_export_${patientId}_${new Date().toISOString().split('T')[0]}.json"`);

        res.json({
            success: true,
            data: exportData
        });
    } catch (error) {
        next(error);
    }
});

// @route   DELETE /api/v1/data-rights/delete-account
// @desc    Delete patient account and all associated data (Right to Erasure — DPDP §12(3))
// @access  Private/Patient
router.delete('/delete-account', authMiddleware, async (req, res, next) => {
    try {
        const patientId = req.user.patientId || req.user.id;
        const ipAddress = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip;

        const { confirmDeletion, reason } = req.body || {};

        // Require explicit confirmation
        if (confirmDeletion !== 'DELETE_MY_ACCOUNT') {
            return res.status(400).json({
                success: false,
                error: 'Please confirm deletion by sending { "confirmDeletion": "DELETE_MY_ACCOUNT" }'
            });
        }

        // Find patient first
        const patient = await Patient.findOne({ patientId });
        if (!patient) {
            return res.status(404).json({
                success: false,
                error: 'Patient account not found'
            });
        }

        // Audit log BEFORE deletion (so we have a record)
        await logAuditEvent({
            userId: patientId,
            userRole: 'patient',
            action: 'DATA_DELETION_REQUEST',
            resourceType: 'patient',
            resourceId: patientId,
            ipAddress,
            userAgent: req.headers['user-agent'],
            phiAccessed: true,
            details: {
                reason: reason || 'Not specified',
                patientEmail: patient.personalInfo?.email
            }
        });

        // Delete all associated data
        const deletionResults = await Promise.allSettled([
            // Anonymize patient record (keep structure for referential integrity)
            Patient.findOneAndUpdate(
                { patientId },
                {
                    $set: {
                        'personalInfo.name': '[DELETED]',
                        'personalInfo.email': `deleted_${patientId}@removed.local`,
                        'personalInfo.phone': null,
                        'personalInfo.avatar': null,
                        'personalInfo.dateOfBirth': null,
                        'personalInfo.age': null,
                        'personalInfo.gender': null,
                        'personalInfo.bloodGroup': null,
                        'medicalInfo.allergies': [],
                        'medicalInfo.chronicConditions': [],
                        'medicalInfo.currentMedications': [],
                        'medicalInfo.emergencyContact': {},
                        googleId: null,
                        connectionStatus: 'rejected',
                        riskLevel: 'low'
                    }
                }
            ),
            // Delete health metrics entirely
            HealthMetrics.deleteMany({ patientId }),
            // Anonymize prescriptions (keep for doctor's records but redact patient info)
            Prescription.updateMany(
                { patientId },
                { $set: { patientName: '[DELETED]' } }
            ),
            // Anonymize appointments
            Appointment.updateMany(
                { patientId },
                { $set: { notes: '[DELETED]', purpose: '[DELETED]', 'consultationReport.findings': '[REDACTED]' } }
            ),
            // Update consent record
            Consent.findOneAndUpdate(
                { patientId },
                {
                    $set: {
                        hasGivenInitialConsent: false,
                        patientName: '[DELETED]',
                        patientEmail: `deleted_${patientId}@removed.local`
                    },
                    $push: {
                        history: {
                            action: 'withdrawn',
                            purpose: 'account_deletion',
                            timestamp: new Date(),
                            ipAddress,
                            version: '1.0'
                        }
                    }
                }
            )
        ]);

        // Log completion
        await logAuditEvent({
            userId: patientId,
            userRole: 'system',
            action: 'DATA_DELETION_COMPLETE',
            resourceType: 'patient',
            resourceId: patientId,
            ipAddress,
            details: {
                results: deletionResults.map((r, i) => ({
                    operation: ['patient_anonymize', 'health_metrics_delete', 'prescriptions_anonymize', 'appointments_anonymize', 'consent_update'][i],
                    status: r.status
                }))
            }
        });

        res.json({
            success: true,
            message: 'Your account and associated data have been deleted/anonymized. Audit logs are retained for compliance purposes.',
            details: {
                personalDataAnonymized: true,
                healthMetricsDeleted: true,
                prescriptionsAnonymized: true,
                appointmentsAnonymized: true,
                consentRecordUpdated: true,
                auditLogsRetained: true // HIPAA requires 6-year retention
            }
        });
    } catch (error) {
        next(error);
    }
});

// @route   GET /api/v1/data-rights/audit-log
// @desc    Get patient's own audit log (Right to Access — DPDP)
// @access  Private/Patient
router.get('/audit-log', authMiddleware, async (req, res, next) => {
    try {
        const userId = req.user.patientId || req.user.doctorId || req.user.id;
        const { limit = 50, page = 1 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const logs = await AuditLog.find({ userId })
            .select('action resourceType timestamp method path statusCode phiAccessed')
            .sort({ timestamp: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .lean();

        const total = await AuditLog.countDocuments({ userId });

        res.json({
            success: true,
            count: logs.length,
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit)),
            data: logs
        });
    } catch (error) {
        next(error);
    }
});

// @route   GET /api/v1/data-rights/audit-log/full
// @desc    Get full audit log (doctor only — for compliance review)
// @access  Private/Doctor
router.get('/audit-log/full', authMiddleware, requireDoctor, async (req, res, next) => {
    try {
        const { limit = 100, page = 1, action, resourceType, startDate, endDate } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const query = {};
        if (action) query.action = action;
        if (resourceType) query.resourceType = resourceType;
        if (startDate && endDate) {
            query.timestamp = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const logs = await AuditLog.find(query)
            .sort({ timestamp: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .lean();

        const total = await AuditLog.countDocuments(query);

        res.json({
            success: true,
            count: logs.length,
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit)),
            data: logs
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
