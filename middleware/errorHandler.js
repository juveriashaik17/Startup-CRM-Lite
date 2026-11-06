/**
 * Global Express Error Handling Middleware.
 * 
 * Express recognizes error-handling middleware by its explicit 4-parameter signature:
 * (err, req, res, next). It catches synchronous and asynchronous unhandled errors forwarded
 * via next(err), maps domain-specific errors (Mongoose, MongoDB, JWT) to proper HTTP status
 * codes and friendly messages, and conceals sensitive stack traces in production.
 * 
 * @param {Error|Object} err - Error object caught from route pipeline.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware callback.
 */
export const errorHandler = (err, req, res, _next) => {
  let statusCode = 500;
  let message = 'Server error';
  let errors = null;

  // 1. Mongoose ValidationError -> 400 with field-by-field error messages
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
    errors = {};
    if (err.errors) {
      Object.keys(err.errors).forEach((key) => {
        errors[key] = err.errors[key].message;
      });
    }
  }
  // 2. Mongoose CastError (invalid ObjectId) -> 404 "Resource not found"
  else if (err.name === 'CastError') {
    statusCode = 404;
    message = 'Resource not found';
  }
  // 3. MongoDB duplicate key (code 11000) -> 409 "Email already exists"
  else if (err.code === 11000) {
    statusCode = 409;
    message = 'Email already exists';
  }
  // 4. JWT errors (JsonWebTokenError, TokenExpiredError) -> 401
  else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = err.name === 'TokenExpiredError'
      ? 'Token expired'
      : 'Invalid token';
  }
  // 5. Everything else -> 500 "Server error" (or preserved custom statusCode if thrown explicitly)
  else {
    statusCode = err.statusCode || 500;
    message = statusCode === 500 ? 'Server error' : (err.message || 'Server error');
  }

  // Construct standard error response payload
  const errorPayload = {
    success: false,
    message,
    errors,
  };

  // In development: include err.stack in the response
  // In production: never send stack traces (prevents sensitive information disclosure)
  if (process.env.NODE_ENV === 'development') {
    errorPayload.stack = err.stack;
    // Log error trace to server console during development
    console.error('Error Trace:', err);
  }

  return res.status(statusCode).json(errorPayload);
};

export default errorHandler;
