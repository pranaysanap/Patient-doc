const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
    doctorId: {
        type: String,
        required: true,
        unique: true,
        default: 'dr_sujal_jadhav_001'
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    passwordHash: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    specialty: {
        type: String,
        default: 'General Physician'
    },
    role: {
        type: String,
        default: 'Chief Medical Officer'
    },
    phone: String,
    avatar: String,
    location: String,
    availableHours: {
        type: String,
        default: '9:00 AM - 6:00 PM'
    },
    credentials: {
        registrationId: String,
        qualifications: [String],
        experience: Number
    },
    lastLogin: Date
}, {
    timestamps: true
});

module.exports = mongoose.model('Doctor', doctorSchema);
