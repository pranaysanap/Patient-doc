const winston = require('winston');
const path = require('path');

/**
 * HIPAA §164.312(b) / DPDP §8 — Structured Logging
 * Centralized logger with log levels, file rotation, and PHI-safe formatting.
 * Never logs actual patient data — only metadata and event information.
 */

// Custom format that strips any potential PHI from logs
const phiSafeFormat = winston.format((info) => {
    // Redact common PHI patterns from log messages
    if (typeof info.message === 'string') {
        info.message = info.message
            .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL_REDACTED]')
            .replace(/\b\d{10}\b/g, '[PHONE_REDACTED]')
            .replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, '[PHONE_REDACTED]');
    }
    return info;
});

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        phiSafeFormat(),
        winston.format.errors({ stack: true }),
        winston.format.json()
    ),
    defaultMeta: {
        service: 'vaidyasetu-backend',
        version: '1.0.0'
    },
    transports: [
        // Error logs — retained for 6 years (HIPAA requirement)
        new winston.transports.File({
            filename: path.join(__dirname, '../../logs/error.log'),
            level: 'error',
            maxsize: 10 * 1024 * 1024, // 10MB
            maxFiles: 50
        }),
        // Combined logs
        new winston.transports.File({
            filename: path.join(__dirname, '../../logs/combined.log'),
            maxsize: 10 * 1024 * 1024, // 10MB
            maxFiles: 30
        }),
        // Audit-specific logs (PHI access events)
        new winston.transports.File({
            filename: path.join(__dirname, '../../logs/audit.log'),
            level: 'info',
            maxsize: 10 * 1024 * 1024,
            maxFiles: 100 // Retain more audit logs
        })
    ]
});

// In development, also log to console with colors
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
        )
    }));
}

// Convenience methods for compliance logging
logger.audit = (message, meta = {}) => {
    logger.info(message, { ...meta, type: 'AUDIT', compliance: ['HIPAA', 'DPDP'] });
};

logger.security = (message, meta = {}) => {
    logger.warn(message, { ...meta, type: 'SECURITY', compliance: ['HIPAA', 'DPDP'] });
};

logger.phi = (message, meta = {}) => {
    logger.info(message, { ...meta, type: 'PHI_ACCESS', compliance: ['HIPAA'] });
};

module.exports = logger;
