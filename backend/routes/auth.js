const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// @route   POST /api/v1/auth/doctor/login
// @desc    Doctor login with username/password
// @access  Public
router.post('/doctor/login', async (req, res, next) => {
    try {
        const { username, password } = req.body;

        // Validation
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                error: 'Please provide username and password'
            });
        }

        // Find doctor
        const doctor = await Doctor.findOne({ username });

        if (!doctor) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, doctor.passwordHash);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }

        // Update last login
        doctor.lastLogin = new Date();
        await doctor.save();

        // Generate JWT
        const token = jwt.sign(
            {
                id: doctor._id,
                doctorId: doctor.doctorId,
                email: doctor.email,
                role: 'doctor'
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        res.json({
            success: true,
            token,
            user: {
                id: doctor._id,
                doctorId: doctor.doctorId,
                name: doctor.name,
                email: doctor.email,
                role: 'doctor',
                specialty: doctor.specialty,
                avatar: doctor.avatar
            }
        });
    } catch (error) {
        next(error);
    }
});

// @route   POST /api/v1/auth/patient/google
// @desc    Patient login with Google OAuth
// @access  Public
router.post('/patient/google', async (req, res, next) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({
                success: false,
                error: 'Google token required'
            });
        }

        // Verify Google token
        const ticket = await googleClient.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();
        const { sub: googleId, email, name, picture } = payload;

        // Find or create patient
        let patient = await Patient.findOne({ 'personalInfo.email': email });

        if (patient) {
            // Update existing patient
            patient.googleId = googleId;
            patient.personalInfo.name = name;
            patient.personalInfo.avatar = picture;
            patient.lastLogin = new Date();
            await patient.save();
        } else {
            // Create new patient
            patient = await Patient.create({
                googleId,
                personalInfo: {
                    name,
                    email,
                    avatar: picture
                },
                doctorId: process.env.DOCTOR_ID || 'dr_sujal_jadhav_001',
                connectionStatus: 'connected',
                lastLogin: new Date()
            });
        }

        // Generate JWT
        const jwtToken = jwt.sign(
            {
                id: patient._id,
                patientId: patient.patientId,
                email: patient.personalInfo.email,
                role: 'patient'
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        res.json({
            success: true,
            token: jwtToken,
            user: {
                id: patient._id,
                patientId: patient.patientId,
                name: patient.personalInfo.name,
                email: patient.personalInfo.email,
                role: 'patient',
                avatar: patient.personalInfo.avatar
            }
        });
    } catch (error) {
        console.error('OAuth error:', error);
        res.status(401).json({
            success: false,
            error: 'Google authentication failed'
        });
    }
});

// @route   POST /api/v1/auth/patient/register
// @desc    Register/login patient using NextAuth session data (no Google token verification)
// @access  Public
router.post('/patient/register', async (req, res, next) => {
    try {
        const { name, email, image } = req.body;

        if (!email || !name) {
            return res.status(400).json({
                success: false,
                error: 'Name and email are required'
            });
        }

        // Atomic upsert — avoids duplicate-key race when React fires multiple requests
        let patient = await Patient.findOneAndUpdate(
            { 'personalInfo.email': email },
            {
                $set: {
                    'personalInfo.name': name,
                    'personalInfo.avatar': image || '',
                    lastLogin: new Date()
                },
                $setOnInsert: {
                    'personalInfo.email': email,
                    doctorId: process.env.DOCTOR_ID || 'dr_sujal_jadhav_001',
                    connectionStatus: 'connected'
                }
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        // Ensure patientId is generated (pre-save hook doesn't fire on findOneAndUpdate)
        if (!patient.patientId) {
            const crypto = require('crypto');
            patient.patientId = 'pat_' + crypto.randomBytes(6).toString('hex');
            await patient.save();
        }

        // Generate JWT
        const jwtToken = jwt.sign(
            {
                id: patient._id,
                patientId: patient.patientId,
                email: patient.personalInfo.email,
                role: 'patient'
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        res.json({
            success: true,
            token: jwtToken,
            user: {
                id: patient._id,
                patientId: patient.patientId,
                name: patient.personalInfo.name,
                email: patient.personalInfo.email,
                role: 'patient',
                avatar: patient.personalInfo.avatar
            }
        });
    } catch (error) {
        next(error);
    }
});

// @route   GET /api/v1/auth/me
// @desc    Get current user info
// @access  Private
router.get('/me', require('../middleware/auth').authMiddleware, async (req, res, next) => {
    try {
        let user;

        if (req.user.role === 'doctor') {
            user = await Doctor.findById(req.user.id).select('-passwordHash');
        } else {
            user = await Patient.findById(req.user.id);
        }

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        res.json({
            success: true,
            user
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
