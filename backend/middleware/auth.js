const jwt = require('jsonwebtoken');

const authMiddleware = async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: 'No token provided. Authorization denied.'
            });
        }

        const token = authHeader.split(' ')[1];

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Add user info to request
        req.user = decoded;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                error: 'Token expired. Please login again.'
            });
        }

        res.status(401).json({
            success: false,
            error: 'Invalid token. Authorization denied.'
        });
    }
};

// Require doctor role
const requireDoctor = (req, res, next) => {
    if (req.user.role !== 'doctor') {
        return res.status(403).json({
            success: false,
            error: 'Access denied. Doctor privileges required.'
        });
    }
    next();
};

// Require patient role
const requirePatient = (req, res, next) => {
    if (req.user.role !== 'patient') {
        return res.status(403).json({
            success: false,
            error: 'Access denied. Patient privileges required.'
        });
    }
    next();
};

module.exports = {
    authMiddleware,
    requireDoctor,
    requirePatient
};
