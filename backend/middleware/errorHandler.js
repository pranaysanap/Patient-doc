/**
 * HIPAA / DPDP Compliant Error Handler
 * This file is kept for backward compatibility.
 * The primary error handler is now sanitizedErrorHandler in dataSanitizer.js
 * which prevents information leakage in error responses.
 */
const { sanitizedErrorHandler } = require('./dataSanitizer');

module.exports = sanitizedErrorHandler;
