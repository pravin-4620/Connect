import { error } from '../utils/response.js';

export const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const errors = {};
        Object.keys(err.errors).forEach(key => {
            errors[key] = err.errors[key].message;
        });
        return error(res, 'Validation Error', 400, errors);
    }

    // JWT Authentication error
    if (err.name === 'UnauthorizedError' || err.name === 'JsonWebTokenError') {
        return error(res, 'Invalid token', 401);
    }

    if (err.name === 'TokenExpiredError') {
        return error(res, 'Token expired', 401);
    }

    // Custom App Error (if we use a class for it, assuming strict structure for now)
    if (err.statusCode) {
        return error(res, err.message, err.statusCode, err.errors);
    }

    // Default 500
    const message = process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error';
    return error(res, message, 500, process.env.NODE_ENV === 'development' ? { stack: err.stack } : null);
};
