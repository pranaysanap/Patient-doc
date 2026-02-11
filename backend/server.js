const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/database');
const { sanitizedErrorHandler, sanitizeRequest, requestId } = require('./middleware/dataSanitizer');
const { auditMiddleware } = require('./middleware/auditLog');

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// ═══════════════════════════════════════════════════════
// HIPAA/DPDP COMPLIANCE: Security Middleware Stack
// ═══════════════════════════════════════════════════════

// Request ID for tracking (compliance requirement)
app.use(requestId);

// Security headers (HIPAA §164.312 — Transmission Security)
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "https://generativelanguage.googleapis.com"],
            frameSrc: ["'none'"],
            objectSrc: ["'none'"]
        }
    },
    hsts: {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true
    },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    crossOriginEmbedderPolicy: false // Allow cross-origin for Google APIs
}));

// Rate limiting (enhanced for compliance)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: { success: false, error: 'Too many requests from this IP, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false
});
app.use('/api/', limiter);

// Stricter rate limit for auth endpoints (brute force protection)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20, // 20 login attempts per 15 minutes
    message: { success: false, error: 'Too many login attempts. Please try again later.' },
    standardHeaders: true,
    legacyHeaders: false
});
app.use('/api/v1/auth', authLimiter);

// CORS configuration
const corsOptions = {
    origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID']
};
app.use(cors(corsOptions));

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Input sanitization (HIPAA — prevent injection attacks)
app.use(sanitizeRequest);

// Compression middleware
app.use(compression());

// Logging middleware (only in development)
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// ═══════════════════════════════════════════════════════
// HIPAA/DPDP COMPLIANCE: Audit Logging
// ═══════════════════════════════════════════════════════
app.use(auditMiddleware);

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'VaidyaSetu Backend API is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        compliance: ['HIPAA', 'DPDP-2023']
    });
});

// ═══════════════════════════════════════════════════════
// API Routes
// ═══════════════════════════════════════════════════════
app.use('/api/v1/auth', require('./routes/auth'));
app.use('/api/v1/patients', require('./routes/patients'));
app.use('/api/v1/prescriptions', require('./routes/prescriptions'));
app.use('/api/v1/appointments', require('./routes/appointments'));
app.use('/api/v1/health-metrics', require('./routes/healthMetrics'));

// HIPAA/DPDP Compliance Routes
app.use('/api/v1/consent', require('./routes/consent'));
app.use('/api/v1/data-rights', require('./routes/dataRights'));
app.use('/api/v1/compliance', require('./routes/compliance'));

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route not found'
    });
});

// Sanitized error handler — NEVER leaks sensitive info (HIPAA requirement)
app.use(sanitizedErrorHandler);

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
    console.log(`\n🚀 VaidyaSetu Backend Server Started`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 Server running on: http://localhost:${PORT}`);
    console.log(`💚 Health check: http://localhost:${PORT}/health\n`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('❌ Unhandled Promise Rejection:', err);
    server.close(() => process.exit(1));
});

module.exports = app;
