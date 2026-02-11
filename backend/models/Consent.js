const mongoose = require('mongoose');

/**
 * DPDP §5-6 / HIPAA Privacy Rule — Consent Management
 * Tracks explicit, informed consent for each data processing purpose.
 * Consent must be freely given, specific, informed, and unambiguous.
 */
const consentSchema = new mongoose.Schema({
    patientId: {
        type: String,
        required: true,
        index: true
    },
    patientEmail: {
        type: String,
        required: true
    },
    patientName: String,

    // Granular consent purposes
    consents: {
        // Core service consent
        dataCollection: {
            granted: { type: Boolean, default: false },
            grantedAt: Date,
            withdrawnAt: Date,
            version: { type: String, default: '1.0' }
        },
        // Health data processing
        healthDataProcessing: {
            granted: { type: Boolean, default: false },
            grantedAt: Date,
            withdrawnAt: Date,
            version: { type: String, default: '1.0' }
        },
        // AI-based analysis (Gemini AI)
        aiAnalysis: {
            granted: { type: Boolean, default: false },
            grantedAt: Date,
            withdrawnAt: Date,
            version: { type: String, default: '1.0' }
        },
        // Sharing data with doctor
        doctorDataSharing: {
            granted: { type: Boolean, default: false },
            grantedAt: Date,
            withdrawnAt: Date,
            version: { type: String, default: '1.0' }
        },
        // Email notifications
        emailNotifications: {
            granted: { type: Boolean, default: false },
            grantedAt: Date,
            withdrawnAt: Date,
            version: { type: String, default: '1.0' }
        },
        // Emergency services (Twilio)
        emergencyServices: {
            granted: { type: Boolean, default: false },
            grantedAt: Date,
            withdrawnAt: Date,
            version: { type: String, default: '1.0' }
        },
        // Fitness/wearable data
        fitnessData: {
            granted: { type: Boolean, default: false },
            grantedAt: Date,
            withdrawnAt: Date,
            version: { type: String, default: '1.0' }
        }
    },

    // Privacy policy version accepted
    privacyPolicyVersion: {
        type: String,
        default: '1.0'
    },
    privacyPolicyAcceptedAt: Date,

    // Terms of service version accepted
    termsVersion: {
        type: String,
        default: '1.0'
    },
    termsAcceptedAt: Date,

    // Consent history (append-only log)
    history: [{
        action: {
            type: String,
            enum: ['granted', 'withdrawn', 'updated'],
            required: true
        },
        purpose: {
            type: String,
            required: true
        },
        timestamp: {
            type: Date,
            default: Date.now
        },
        ipAddress: String,
        userAgent: String,
        version: String
    }],

    // DPDP §9 — Minor's consent
    isMinor: {
        type: Boolean,
        default: false
    },
    parentalConsentGiven: {
        type: Boolean,
        default: false
    },
    parentGuardianName: String,
    parentGuardianEmail: String,

    // Overall consent status
    hasGivenInitialConsent: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Compound index
consentSchema.index({ patientId: 1, 'consents.dataCollection.granted': 1 });

module.exports = mongoose.model('Consent', consentSchema);
