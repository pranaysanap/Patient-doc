const mongoose = require('mongoose');
const crypto = require('crypto');

const appointmentSchema = new mongoose.Schema({
    appointmentId: {
        type: String,
        unique: true
    },
    patientId: {
        type: String,
        required: true,
        index: true
    },
    doctorId: {
        type: String,
        required: true,
        default: process.env.DOCTOR_ID || 'dr_sujal_jadhav_001'
    },
    scheduledBy: {
        type: String,
        enum: ['patient', 'doctor'],
        required: true
    },
    appointmentDate: {
        type: Date,
        required: true
    },
    type: {
        type: String,
        enum: ['Online', 'In-Person'],
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'completed', 'cancelled', 'rejected'],
        default: 'pending'
    },
    purpose: String,
    notes: String,
    consultationReport: {
        findings: String,
        recommendations: String,
        followUpRequired: Boolean,
        followUpDate: Date,
        completedAt: Date
    },
    meetingLink: String,
    location: String
}, {
    timestamps: true
});

// Generate unique appointment ID
appointmentSchema.pre('save', function (next) {
    if (!this.appointmentId) {
        this.appointmentId = 'apt_' + crypto.randomBytes(6).toString('hex');
    }
    next();
});

// Index for efficient queries
appointmentSchema.index({ doctorId: 1, status: 1, appointmentDate: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
