const mongoose = require('mongoose');
const crypto = require('crypto');

const prescriptionSchema = new mongoose.Schema({
    prescriptionId: {
        type: String,
        unique: true
    },
    patientId: {
        type: String,
        required: true,
        index: true
    },
    patientName: {
        type: String,
        default: ''
    },
    doctorId: {
        type: String,
        required: true,
        default: process.env.DOCTOR_ID || 'dr_sujal_jadhav_001'
    },
    doctorName: {
        type: String,
        default: 'Dr. Sujal Jadhav'
    },
    diagnosis: {
        type: String,
        required: true
    },
    medicines: [{
        name: {
            type: String,
            required: true
        },
        dosage: String,
        schedule: {
            morning: Boolean,
            afternoon: Boolean,
            night: Boolean
        },
        food: {
            type: String,
            enum: ['Before', 'After']
        },
        duration: String,
        instructions: String
    }],
    instructions: String,
    status: {
        type: String,
        enum: ['active', 'completed', 'discontinued'],
        default: 'active'
    },
    pdfFileId: mongoose.Schema.Types.ObjectId,
    pdfUrl: String,
    issuedDate: {
        type: Date,
        default: Date.now
    },
    expiryDate: Date
}, {
    timestamps: true
});

// Generate unique prescription ID
prescriptionSchema.pre('save', function (next) {
    if (!this.prescriptionId) {
        this.prescriptionId = 'rx_' + crypto.randomBytes(6).toString('hex');
    }
    next();
});

// Index for efficient queries
prescriptionSchema.index({ patientId: 1, status: 1 });

module.exports = mongoose.model('Prescription', prescriptionSchema);
