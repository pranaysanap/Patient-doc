const express = require('express');
const router = express.Router();
const Prescription = require('../models/Prescription');
const { authMiddleware, requireDoctor } = require('../middleware/auth');

// @route   POST /api/v1/prescriptions
// @desc    Create new prescription (doctor only)
// @access  Private/Doctor
router.post('/', authMiddleware, requireDoctor, async (req, res, next) => {
    try {
        const { patientId, diagnosis, medicines, instructions, expiryDate, patientName } = req.body;

        // Resolve patient name if not provided
        let resolvedPatientName = patientName || '';
        if (!resolvedPatientName && patientId) {
            const Patient = require('../models/Patient');
            const patient = await Patient.findOne({ patientId });
            if (patient) resolvedPatientName = patient.personalInfo?.name || '';
        }

        const prescription = await Prescription.create({
            patientId,
            patientName: resolvedPatientName,
            doctorId: req.user.doctorId,
            doctorName: 'Dr. Sujal Jadhav',
            diagnosis,
            medicines,
            instructions,
            issuedDate: new Date(),
            expiryDate: expiryDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days default
        });

        res.status(201).json({
            success: true,
            data: prescription
        });
    } catch (error) {
        next(error);
    }
});

// @route   GET /api/v1/prescriptions/doctor
// @desc    Get all prescriptions created by logged-in doctor
// @access  Private/Doctor
router.get('/doctor', authMiddleware, requireDoctor, async (req, res, next) => {
    try {
        const { status } = req.query;
        const query = { doctorId: req.user.doctorId };
        if (status) {
            query.status = status;
        }
        const prescriptions = await Prescription.find(query)
            .sort({ issuedDate: -1 });
        res.json({
            success: true,
            count: prescriptions.length,
            data: prescriptions
        });
    } catch (error) {
        next(error);
    }
});

// @route   GET /api/v1/prescriptions/patient/:patientId
// @desc    Get all prescriptions for a patient
// @access  Private
router.get('/patient/:patientId', authMiddleware, async (req, res, next) => {
    try {
        const { status } = req.query;

        const query = { patientId: req.params.patientId };
        if (status) {
            query.status = status;
        }

        const prescriptions = await Prescription.find(query)
            .sort({ issuedDate: -1 });

        res.json({
            success: true,
            count: prescriptions.length,
            data: prescriptions
        });
    } catch (error) {
        next(error);
    }
});

// @route   GET /api/v1/prescriptions/:prescriptionId
// @desc    Get specific prescription
// @access  Private
router.get('/:prescriptionId', authMiddleware, async (req, res, next) => {
    try {
        const prescription = await Prescription.findOne({
            prescriptionId: req.params.prescriptionId
        });

        if (!prescription) {
            return res.status(404).json({
                success: false,
                error: 'Prescription not found'
            });
        }

        res.json({
            success: true,
            data: prescription
        });
    } catch (error) {
        next(error);
    }
});

// @route   PUT /api/v1/prescriptions/:prescriptionId
// @desc    Update prescription (doctor only)
// @access  Private/Doctor
router.put('/:prescriptionId', authMiddleware, requireDoctor, async (req, res, next) => {
    try {
        const prescription = await Prescription.findOneAndUpdate(
            { prescriptionId: req.params.prescriptionId },
            req.body,
            { new: true, runValidators: true }
        );

        if (!prescription) {
            return res.status(404).json({
                success: false,
                error: 'Prescription not found'
            });
        }

        res.json({
            success: true,
            data: prescription
        });
    } catch (error) {
        next(error);
    }
});

// @route   PATCH /api/v1/prescriptions/:prescriptionId/status
// @desc    Update prescription status
// @access  Private/Doctor
router.patch('/:prescriptionId/status', authMiddleware, requireDoctor, async (req, res, next) => {
    try {
        const { status } = req.body;

        if (!['active', 'completed', 'discontinued'].includes(status)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid status'
            });
        }

        const prescription = await Prescription.findOneAndUpdate(
            { prescriptionId: req.params.prescriptionId },
            { status },
            { new: true }
        );

        if (!prescription) {
            return res.status(404).json({
                success: false,
                error: 'Prescription not found'
            });
        }

        res.json({
            success: true,
            data: prescription
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
