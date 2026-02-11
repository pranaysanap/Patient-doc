const mongoose = require('mongoose');

/**
 * HIPAA §164.404 / DPDP §8(6) — Security Incident & Breach Tracking
 * Tracks security incidents and data breaches.
 * Breach notification required within 72 hours (DPDP) / 60 days (HIPAA).
 */
const securityIncidentSchema = new mongoose.Schema({
    incidentId: {
        type: String,
        unique: true,
        required: true
    },
    // Type of incident
    type: {
        type: String,
        enum: ['breach', 'unauthorized_access', 'data_leak', 'system_compromise', 'phishing', 'other'],
        required: true
    },
    severity: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        required: true
    },
    status: {
        type: String,
        enum: ['detected', 'investigating', 'contained', 'resolved', 'reported'],
        default: 'detected'
    },

    // Description
    title: {
        type: String,
        required: true
    },
    description: String,

    // Affected data
    affectedPatientIds: [String],
    affectedDataTypes: [{
        type: String,
        enum: ['personal_info', 'medical_records', 'prescriptions', 'health_metrics', 'credentials', 'financial']
    }],
    estimatedRecordsAffected: Number,

    // Discovery & notification timeline
    discoveredAt: {
        type: Date,
        required: true,
        default: Date.now
    },
    containedAt: Date,
    reportedToAuthorityAt: Date,
    patientsNotifiedAt: Date,
    resolvedAt: Date,

    // DPDP: Must notify Data Protection Board within 72 hours
    notificationDeadline: {
        type: Date
    },

    // Response actions taken
    actionsTaken: [{
        action: String,
        takenBy: String,
        timestamp: { type: Date, default: Date.now }
    }],

    // Root cause
    rootCause: String,
    preventiveMeasures: String,

    // Reporter
    reportedBy: String,
    reportedByRole: String
}, {
    timestamps: true
});

// Auto-calculate notification deadline (72 hours from discovery — DPDP)
securityIncidentSchema.pre('save', function (next) {
    if (!this.notificationDeadline && this.discoveredAt) {
        this.notificationDeadline = new Date(this.discoveredAt.getTime() + 72 * 60 * 60 * 1000);
    }
    next();
});

module.exports = mongoose.model('SecurityIncident', securityIncidentSchema);
