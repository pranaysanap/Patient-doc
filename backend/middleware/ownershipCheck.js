/**
 * HIPAA §164.312(a) / DPDP §8(4) — Ownership Verification Middleware
 * Ensures patients can only access their OWN data (prevents IDOR attacks).
 * Doctors can access any patient's data (they have legitimate access).
 */

/**
 * Verify that the requesting patient owns the resource identified by :patientId.
 * Doctors bypass this check (they have legitimate access to all patients).
 */
const verifyPatientOwnership = (req, res, next) => {
    // Doctors can access any patient's data
    if (req.user.role === 'doctor') {
        return next();
    }

    // For patients — verify ownership
    const requestedPatientId = req.params.patientId;
    const authenticatedPatientId = req.user.patientId;

    if (!requestedPatientId) {
        return next(); // No patientId in params — let the route handle it
    }

    if (requestedPatientId !== authenticatedPatientId) {
        return res.status(403).json({
            success: false,
            error: 'Access denied. You can only access your own data.'
        });
    }

    next();
};

/**
 * Verify that the requesting user has access to the specified prescription.
 * Patients can only view their own prescriptions.
 */
const verifyPrescriptionAccess = async (req, res, next) => {
    // Doctors can access any prescription
    if (req.user.role === 'doctor') {
        return next();
    }

    try {
        const Prescription = require('../models/Prescription');
        const prescriptionId = req.params.prescriptionId;

        if (!prescriptionId) return next();

        const prescription = await Prescription.findOne({ prescriptionId });
        if (!prescription) {
            return res.status(404).json({
                success: false,
                error: 'Prescription not found'
            });
        }

        if (prescription.patientId !== req.user.patientId) {
            return res.status(403).json({
                success: false,
                error: 'Access denied. You can only access your own prescriptions.'
            });
        }

        // Attach prescription to request to avoid re-fetching
        req.resource = prescription;
        next();
    } catch (error) {
        next(error);
    }
};

/**
 * Verify that the requesting user has access to the specified appointment.
 * Patients can only view/modify their own appointments.
 */
const verifyAppointmentAccess = async (req, res, next) => {
    // Doctors can access any appointment
    if (req.user.role === 'doctor') {
        return next();
    }

    try {
        const Appointment = require('../models/Appointment');
        const appointmentId = req.params.appointmentId;

        if (!appointmentId) return next();

        const appointment = await Appointment.findOne({ appointmentId });
        if (!appointment) {
            return res.status(404).json({
                success: false,
                error: 'Appointment not found'
            });
        }

        if (appointment.patientId !== req.user.patientId) {
            return res.status(403).json({
                success: false,
                error: 'Access denied. You can only access your own appointments.'
            });
        }

        req.resource = appointment;
        next();
    } catch (error) {
        next(error);
    }
};

/**
 * Consent gate — check that the patient has given consent for the data type being accessed.
 * Usage: consentGate('healthDataProcessing') or consentGate('doctorDataSharing')
 */
const consentGate = (requiredConsent) => {
    return async (req, res, next) => {
        // Doctors bypass consent gate (they access data under treatment purpose)
        if (req.user.role === 'doctor') {
            return next();
        }

        try {
            const Consent = require('../models/Consent');
            const patientId = req.user.patientId || req.params.patientId;

            if (!patientId) return next();

            const consent = await Consent.findOne({ patientId });

            if (!consent || !consent.hasGivenInitialConsent) {
                return res.status(403).json({
                    success: false,
                    error: 'You must provide consent before accessing this feature.',
                    requiresConsent: true
                });
            }

            if (requiredConsent && !consent.consents[requiredConsent]?.granted) {
                return res.status(403).json({
                    success: false,
                    error: `This feature requires "${requiredConsent}" consent. Please update your privacy preferences.`,
                    requiresConsent: true,
                    requiredConsentType: requiredConsent
                });
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};

module.exports = {
    verifyPatientOwnership,
    verifyPrescriptionAccess,
    verifyAppointmentAccess,
    consentGate
};
