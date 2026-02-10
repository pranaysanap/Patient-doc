const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');
const { authMiddleware, requireDoctor } = require('../middleware/auth');

// @route   GET /api/v1/patients
// @desc    Get all patients (doctor only)
// @access  Private/Doctor
router.get('/', authMiddleware, requireDoctor, async (req, res, next) => {
    try {
        const patients = await Patient.find({ doctorId: req.user.doctorId })
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: patients.length,
            data: patients
        });
    } catch (error) {
        next(error);
    }
});

// @route   GET /api/v1/patients/pending
// @desc    Get patients with pending connection status (for doctor requests page)
// @access  Private/Doctor
router.get('/pending', authMiddleware, requireDoctor, async (req, res, next) => {
    try {
        const patients = await Patient.find({
            doctorId: req.user.doctorId,
            connectionStatus: 'pending'
        }).sort({ createdAt: -1 });

        res.json({
            success: true,
            count: patients.length,
            data: patients
        });
    } catch (error) {
        next(error);
    }
});

// @route   GET /api/v1/patients/:patientId
// @desc    Get patient by ID
// @access  Private
router.get('/:patientId', authMiddleware, async (req, res, next) => {
    try {
        const patient = await Patient.findOne({ patientId: req.params.patientId });

        if (!patient) {
            return res.status(404).json({
                success: false,
                error: 'Patient not found'
            });
        }

        // Check authorization
        if (req.user.role === 'patient' && patient._id.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to access this patient'
            });
        }

        res.json({
            success: true,
            data: patient
        });
    } catch (error) {
        next(error);
    }
});

// @route   PUT /api/v1/patients/:patientId
// @desc    Update patient info
// @access  Private
router.put('/:patientId', authMiddleware, async (req, res, next) => {
    try {
        let patient = await Patient.findOne({ patientId: req.params.patientId });

        if (!patient) {
            return res.status(404).json({
                success: false,
                error: 'Patient not found'
            });
        }

        // Check authorization
        if (req.user.role === 'patient' && patient._id.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to update this patient'
            });
        }

        // Update allowed fields
        const { personalInfo, medicalInfo, riskLevel } = req.body;

        if (personalInfo) {
            patient.personalInfo = { ...patient.personalInfo, ...personalInfo };
        }
        if (medicalInfo) {
            patient.medicalInfo = { ...patient.medicalInfo, ...medicalInfo };
        }
        if (riskLevel && req.user.role === 'doctor') {
            patient.riskLevel = riskLevel;
        }

        await patient.save();

        res.json({
            success: true,
            data: patient
        });
    } catch (error) {
        next(error);
    }
});

// @route   PATCH /api/v1/patients/:patientId/status
// @desc    Update connection status (doctor only)
// @access  Private/Doctor
router.patch('/:patientId/status', authMiddleware, requireDoctor, async (req, res, next) => {
    try {
        const { connectionStatus } = req.body;

        if (!['pending', 'connected', 'rejected'].includes(connectionStatus)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid connection status'
            });
        }

        const patient = await Patient.findOneAndUpdate(
            { patientId: req.params.patientId },
            { connectionStatus },
            { new: true }
        );

        if (!patient) {
            return res.status(404).json({
                success: false,
                error: 'Patient not found'
            });
        }

        res.json({
            success: true,
            data: patient
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
