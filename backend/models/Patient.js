const mongoose = require('mongoose');
const crypto = require('crypto');

const patientSchema = new mongoose.Schema({
    patientId: {
        type: String,
        unique: true
    },
    googleId: {
        type: String,
        sparse: true,
        unique: true
    },
    personalInfo: {
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true,
            unique: true
        },
        phone: String,
        age: Number,
        gender: {
            type: String,
            enum: ['Male', 'Female', 'Other']
        },
        bloodGroup: String,
        dateOfBirth: Date,
        avatar: String
    },
    medicalInfo: {
        allergies: [String],
        chronicConditions: [String],
        currentMedications: [String],
        emergencyContact: {
            name: String,
            relationship: String,
            phone: String
        }
    },
    doctorId: {
        type: String,
        required: true,
        default: process.env.DOCTOR_ID || 'dr_sujal_jadhav_001'
    },
    connectionStatus: {
        type: String,
        enum: ['pending', 'connected', 'rejected'],
        default: 'connected'
    },
    riskLevel: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'low'
    },
    lastVisit: Date,
    lastLogin: Date
}, {
    timestamps: true
});

// Generate unique patient ID before saving
patientSchema.pre('save', function (next) {
    if (!this.patientId) {
        this.patientId = 'pat_' + crypto.randomBytes(6).toString('hex');
    }
    next();
});

module.exports = mongoose.model('Patient', patientSchema);
