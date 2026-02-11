/**
 * HIPAA / DPDP — Data Sanitization Middleware
 * Prevents information leakage in error responses and sanitizes inputs.
 */

const Joi = require('joi');

/**
 * Sanitize error responses — never expose stack traces, internal paths, or DB details.
 * Replaces the default errorHandler with compliance-safe error responses.
 */
const sanitizedErrorHandler = (err, req, res, next) => {
    // Log detailed error internally (for debugging — use structured logger in production)
    const errorLog = {
        timestamp: new Date().toISOString(),
        method: req.method,
        path: req.originalUrl,
        statusCode: err.statusCode || 500,
        errorName: err.name,
        // Only log stack in development
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    };
    console.error('[ERROR]', JSON.stringify(errorLog));

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map(e => e.message);
        return res.status(400).json({
            success: false,
            error: 'Validation Error',
            details: errors
        });
    }

    // Mongoose duplicate key error
    if (err.code === 11000) {
        return res.status(400).json({
            success: false,
            error: 'A record with this information already exists'
        });
    }

    // Mongoose cast error (invalid ObjectId)
    if (err.name === 'CastError') {
        return res.status(400).json({
            success: false,
            error: 'Invalid ID format'
        });
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            error: 'Invalid authentication token'
        });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            error: 'Authentication token has expired'
        });
    }

    // Rate limit errors
    if (err.statusCode === 429) {
        return res.status(429).json({
            success: false,
            error: 'Too many requests. Please try again later.'
        });
    }

    // Default: NEVER send raw error messages in production
    const statusCode = err.statusCode || 500;
    const isProduction = process.env.NODE_ENV === 'production';

    res.status(statusCode).json({
        success: false,
        error: isProduction
            ? 'An internal error occurred. Please try again later.'
            : (err.message || 'Internal Server Error'),
        // Only include request ID for tracking (useful for support)
        ...(req.requestId && { requestId: req.requestId })
    });
};

/**
 * Input sanitization — strip potential XSS/injection from string fields.
 */
const sanitizeInput = (obj) => {
    if (typeof obj === 'string') {
        return obj
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/<[^>]*>/g, '')
            .replace(/javascript:/gi, '')
            .replace(/on\w+\s*=/gi, '')
            .trim();
    }
    if (Array.isArray(obj)) {
        return obj.map(sanitizeInput);
    }
    if (obj && typeof obj === 'object') {
        const sanitized = {};
        for (const [key, value] of Object.entries(obj)) {
            sanitized[key] = sanitizeInput(value);
        }
        return sanitized;
    }
    return obj;
};

/**
 * Request sanitization middleware — sanitizes req.body, req.query, req.params.
 */
const sanitizeRequest = (req, res, next) => {
    if (req.body) req.body = sanitizeInput(req.body);
    if (req.query) req.query = sanitizeInput(req.query);
    if (req.params) req.params = sanitizeInput(req.params);
    next();
};

/**
 * Request ID middleware — attaches unique ID for error tracking.
 */
const requestId = (req, res, next) => {
    const id = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    req.requestId = id;
    res.setHeader('X-Request-ID', id);
    next();
};

/**
 * Joi validation schemas for critical endpoints.
 * HIPAA requires input validation to prevent injection attacks.
 */
const validationSchemas = {
    doctorLogin: Joi.object({
        username: Joi.string().pattern(/^[a-zA-Z0-9._-]+$/).min(3).max(50).required(),
        password: Joi.string().min(6).max(128).required()
    }),

    patientRegister: Joi.object({
        name: Joi.string().min(1).max(100).required(),
        email: Joi.string().email({ tlds: { allow: false } }).required(),
        image: Joi.string().uri().allow('').optional()
    }),

    createPrescription: Joi.object({
        patientId: Joi.string().required(),
        patientName: Joi.string().allow('').optional(),
        diagnosis: Joi.string().min(1).max(1000).required(),
        medicines: Joi.array().items(Joi.object({
            name: Joi.string().required(),
            dosage: Joi.string().allow('').optional(),
            schedule: Joi.object({
                morning: Joi.boolean().optional(),
                afternoon: Joi.boolean().optional(),
                night: Joi.boolean().optional()
            }).optional(),
            food: Joi.string().valid('Before', 'After').optional(),
            duration: Joi.string().allow('').optional(),
            instructions: Joi.string().allow('').optional()
        })).min(1).required(),
        instructions: Joi.string().allow('').optional(),
        expiryDate: Joi.date().optional()
    }),

    createAppointment: Joi.object({
        patientId: Joi.string().required(),
        appointmentDate: Joi.date().required(),
        type: Joi.string().valid('Online', 'In-Person').required(),
        purpose: Joi.string().max(500).optional(),
        notes: Joi.string().max(2000).optional(),
        meetingLink: Joi.string().uri().allow('').optional(),
        location: Joi.string().max(200).allow('').optional(),
        patientName: Joi.string().allow('').optional(),
        patientEmail: Joi.string().email().allow('').optional()
    }),

    healthMetrics: Joi.object({
        vitals: Joi.object({
            heartRate: Joi.object().optional(),
            bloodOxygen: Joi.object().optional(),
            bloodPressure: Joi.object().optional(),
            temperature: Joi.number().min(90).max(115).optional(),
            sleepScore: Joi.number().min(0).max(100).optional(),
            stressLevel: Joi.string().valid('low', 'medium', 'high').optional()
        }).optional(),
        activity: Joi.object({
            steps: Joi.number().min(0).optional(),
            caloriesBurned: Joi.number().min(0).optional(),
            activeMinutes: Joi.number().min(0).optional(),
            distance: Joi.number().min(0).optional()
        }).optional()
    }),

    consent: Joi.object({
        dataCollection: Joi.boolean().optional(),
        healthDataProcessing: Joi.boolean().optional(),
        aiAnalysis: Joi.boolean().optional(),
        doctorDataSharing: Joi.boolean().optional(),
        emailNotifications: Joi.boolean().optional(),
        emergencyServices: Joi.boolean().optional(),
        fitnessData: Joi.boolean().optional(),
        privacyPolicyAccepted: Joi.boolean().optional(),
        termsAccepted: Joi.boolean().optional(),
        isMinor: Joi.boolean().optional(),
        parentGuardianName: Joi.string().allow('').optional(),
        parentGuardianEmail: Joi.string().email().allow('').optional()
    })
};

/**
 * Validate request body against a Joi schema.
 */
const validate = (schemaName) => {
    return (req, res, next) => {
        const schema = validationSchemas[schemaName];
        if (!schema) return next();

        const { error } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
        if (error) {
            const details = error.details.map(d => d.message);
            return res.status(400).json({
                success: false,
                error: 'Validation Error',
                details
            });
        }
        next();
    };
};

module.exports = {
    sanitizedErrorHandler,
    sanitizeRequest,
    requestId,
    validate,
    validationSchemas
};
