const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const { authMiddleware, requireDoctor } = require('../middleware/auth');
const { verifyPatientOwnership, verifyAppointmentAccess, consentGate } = require('../middleware/ownershipCheck');
const { validate } = require('../middleware/dataSanitizer');
const { generateMeetLink, sendAppointmentEmails } = require('../utils/emailService');

// @route   POST /api/v1/appointments
// @desc    Create new appointment
// @access  Private (consent required)
router.post('/', authMiddleware, validate('createAppointment'), async (req, res, next) => {
    try {
        const {
            patientId,
            appointmentDate,
            type,
            purpose,
            notes,
            meetingLink,
            location,
            patientName,
            patientEmail,
        } = req.body;

        // Auto-generate Google Meet link for online appointments
        const isOnline = type === 'Online';
        const finalMeetingLink = isOnline ? (meetingLink || generateMeetLink()) : meetingLink;

        const appointment = await Appointment.create({
            patientId,
            doctorId: process.env.DOCTOR_ID || 'dr_sujal_jadhav_001',
            scheduledBy: req.user.role,
            appointmentDate,
            type,
            purpose,
            notes,
            meetingLink: finalMeetingLink,
            location,
            status: req.user.role === 'doctor' ? 'confirmed' : 'pending'
        });

        // Resolve patient email if not provided
        let resolvedPatientEmail = patientEmail || '';
        let resolvedPatientName = patientName || '';
        if (patientId && (!resolvedPatientEmail || !resolvedPatientName)) {
            try {
                const patient = await Patient.findOne({ patientId });
                if (patient) {
                    resolvedPatientEmail = resolvedPatientEmail || patient.personalInfo?.email || '';
                    resolvedPatientName = resolvedPatientName || patient.personalInfo?.name || '';
                }
            } catch (e) {
                console.error('Could not look up patient for email:', e.message);
            }
        }

        // Send emails asynchronously (don't block the response)
        const doctorEmail = process.env.SMTP_EMAIL;
        const doctorName = process.env.DOCTOR_DISPLAY_NAME || 'Dr. Sujal Jadhav';

        if (resolvedPatientEmail || doctorEmail) {
            sendAppointmentEmails({
                patientName: resolvedPatientName,
                patientEmail: resolvedPatientEmail,
                doctorName,
                doctorEmail,
                appointmentDate,
                appointmentType: type,
                purpose,
                notes,
                meetingLink: finalMeetingLink,
                appointmentId: appointment.appointmentId,
            }).catch(err => {
                console.error('❌ Failed to send appointment emails:', err.message);
            });
        }

        res.status(201).json({
            success: true,
            data: appointment
        });
    } catch (error) {
        next(error);
    }
});

// @route   GET /api/v1/appointments/doctor
// @desc    Get all appointments for doctor
// @access  Private/Doctor
router.get('/doctor', authMiddleware, requireDoctor, async (req, res, next) => {
    try {
        const { status, startDate, endDate } = req.query;

        const query = { doctorId: req.user.doctorId };

        if (status) {
            query.status = status;
        }

        if (startDate && endDate) {
            query.appointmentDate = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const appointments = await Appointment.find(query)
            .sort({ appointmentDate: 1 });

        res.json({
            success: true,
            count: appointments.length,
            data: appointments
        });
    } catch (error) {
        next(error);
    }
});

// @route   GET /api/v1/appointments/patient/:patientId
// @desc    Get appointments for a patient
// @access  Private (ownership verified)
router.get('/patient/:patientId', authMiddleware, verifyPatientOwnership, async (req, res, next) => {
    try {
        const appointments = await Appointment.find({
            patientId: req.params.patientId
        }).sort({ appointmentDate: -1 });

        res.json({
            success: true,
            count: appointments.length,
            data: appointments
        });
    } catch (error) {
        next(error);
    }
});

// @route   PATCH /api/v1/appointments/:appointmentId/status
// @desc    Update appointment status
// @access  Private (ownership verified)
router.patch('/:appointmentId/status', authMiddleware, verifyAppointmentAccess, async (req, res, next) => {
    try {
        const { status } = req.body;

        if (!['pending', 'confirmed', 'completed', 'cancelled', 'rejected'].includes(status)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid status'
            });
        }

        const appointment = await Appointment.findOneAndUpdate(
            { appointmentId: req.params.appointmentId },
            { status },
            { new: true }
        );

        if (!appointment) {
            return res.status(404).json({
                success: false,
                error: 'Appointment not found'
            });
        }

        res.json({
            success: true,
            data: appointment
        });
    } catch (error) {
        next(error);
    }
});

// @route   PUT /api/v1/appointments/:appointmentId/report
// @desc    Add consultation report (doctor only)
// @access  Private/Doctor
router.put('/:appointmentId/report', authMiddleware, requireDoctor, async (req, res, next) => {
    try {
        const { findings, recommendations, followUpRequired, followUpDate } = req.body;

        const appointment = await Appointment.findOneAndUpdate(
            { appointmentId: req.params.appointmentId },
            {
                status: 'completed',
                consultationReport: {
                    findings,
                    recommendations,
                    followUpRequired,
                    followUpDate,
                    completedAt: new Date()
                }
            },
            { new: true }
        );

        if (!appointment) {
            return res.status(404).json({
                success: false,
                error: 'Appointment not found'
            });
        }

        res.json({
            success: true,
            data: appointment
        });
    } catch (error) {
        next(error);
    }
});

// @route   DELETE /api/v1/appointments/:appointmentId
// @desc    Cancel appointment
// @access  Private (ownership verified)
router.delete('/:appointmentId', authMiddleware, verifyAppointmentAccess, async (req, res, next) => {
    try {
        const appointment = await Appointment.findOneAndUpdate(
            { appointmentId: req.params.appointmentId },
            { status: 'cancelled' },
            { new: true }
        );

        if (!appointment) {
            return res.status(404).json({
                success: false,
                error: 'Appointment not found'
            });
        }

        res.json({
            success: true,
            message: 'Appointment cancelled',
            data: appointment
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
