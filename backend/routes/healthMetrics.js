const express = require('express');
const router = express.Router();
const HealthMetrics = require('../models/HealthMetrics');
const { authMiddleware } = require('../middleware/auth');
const { verifyPatientOwnership, consentGate } = require('../middleware/ownershipCheck');
const { validate } = require('../middleware/dataSanitizer');

// @route   POST /api/v1/health-metrics/:patientId
// @desc    Upload/replace health metrics (smartwatch data)
// @access  Private (ownership verified, consent required)
router.post('/:patientId', authMiddleware, verifyPatientOwnership, consentGate('healthDataProcessing'), validate('healthMetrics'), async (req, res, next) => {
    try {
        const { patientId } = req.params;
        const { vitals, activity } = req.body;

        // Get today's date string
        const today = new Date().toISOString().split('T')[0];

        // UPSERT: Replace existing metrics for today
        const metrics = await HealthMetrics.findOneAndUpdate(
            { patientId, date: today },
            {
                $set: {
                    patientId,
                    timestamp: new Date(),
                    date: today,
                    vitals,
                    activity,
                    updatedAt: new Date()
                }
            },
            {
                upsert: true,
                new: true,
                setDefaultsOnInsert: true
            }
        );

        // Check for critical values
        const alerts = checkCriticalValues(vitals);

        res.json({
            success: true,
            data: metrics,
            alerts: alerts.length > 0 ? alerts : null
        });
    } catch (error) {
        next(error);
    }
});

// @route   GET /api/v1/health-metrics/:patientId/latest
// @desc    Get latest health metrics for patient
// @access  Private (ownership verified)
router.get('/:patientId/latest', authMiddleware, verifyPatientOwnership, consentGate('healthDataProcessing'), async (req, res, next) => {
    try {
        const metrics = await HealthMetrics.findOne({
            patientId: req.params.patientId
        }).sort({ timestamp: -1 });

        // Return empty defaults instead of 404 so the dashboard renders gracefully
        if (!metrics) {
            return res.json({
                success: true,
                data: null
            });
        }

        res.json({
            success: true,
            data: metrics
        });
    } catch (error) {
        next(error);
    }
});

// @route   GET /api/v1/health-metrics/:patientId/history
// @desc    Get health metrics history (date range)
// @access  Private (ownership verified)
router.get('/:patientId/history', authMiddleware, verifyPatientOwnership, async (req, res, next) => {
    try {
        const { startDate, endDate, limit = 30 } = req.query;

        const query = { patientId: req.params.patientId };

        if (startDate && endDate) {
            query.date = {
                $gte: startDate,
                $lte: endDate
            };
        }

        const metrics = await HealthMetrics.find(query)
            .sort({ date: -1 })
            .limit(parseInt(limit));

        res.json({
            success: true,
            count: metrics.length,
            data: metrics
        });
    } catch (error) {
        next(error);
    }
});

// Helper function to check critical values
function checkCriticalValues(vitals) {
    const alerts = [];

    if (vitals.heartRate) {
        if (vitals.heartRate.current > 100 || vitals.heartRate.current < 60) {
            alerts.push({
                type: 'urgent',
                title: 'Abnormal Heart Rate',
                message: `Heart rate at ${vitals.heartRate.current} bpm`
            });
        }
    }

    if (vitals.bloodOxygen && vitals.bloodOxygen.current < 90) {
        alerts.push({
            type: 'urgent',
            title: 'Low Blood Oxygen',
            message: `Blood oxygen at ${vitals.bloodOxygen.current}%`
        });
    }

    if (vitals.bloodPressure) {
        if (vitals.bloodPressure.systolic > 140 || vitals.bloodPressure.diastolic > 90) {
            alerts.push({
                type: 'urgent',
                title: 'High Blood Pressure',
                message: `BP: ${vitals.bloodPressure.systolic}/${vitals.bloodPressure.diastolic}`
            });
        }
    }

    return alerts;
}

module.exports = router;
