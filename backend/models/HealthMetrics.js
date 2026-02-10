const mongoose = require('mongoose');

const healthMetricsSchema = new mongoose.Schema({
    patientId: {
        type: String,
        required: true,
        index: true
    },
    timestamp: {
        type: Date,
        required: true,
        default: Date.now
    },
    date: {
        type: String,
        required: true,
        index: true
    },
    vitals: {
        heartRate: {
            current: Number,
            min: Number,
            max: Number,
            readings: [{
                time: String,
                bpm: Number
            }]
        },
        bloodOxygen: {
            current: Number,
            min: Number,
            max: Number
        },
        bloodPressure: {
            systolic: Number,
            diastolic: Number,
            timestamp: Date
        },
        temperature: Number,
        sleepScore: Number,
        stressLevel: {
            type: String,
            enum: ['low', 'medium', 'high']
        }
    },
    activity: {
        steps: Number,
        caloriesBurned: Number,
        activeMinutes: Number,
        distance: Number
    }
}, {
    timestamps: true
});

// Compound index for unique patient+date combination (for replacement logic)
healthMetricsSchema.index({ patientId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('HealthMetrics', healthMetricsSchema);
