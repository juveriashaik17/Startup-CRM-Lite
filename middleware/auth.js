import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';
import localStore from '../utils/localStore.js';

/**
 * Authentication Protection Middleware
 * 
 * Verifies the JSON Web Token (JWT) provided in the HTTP Authorization header.
 * If valid and the corresponding user exists and is active, attaches the sanitized
 * user document to `req.user` for downstream route handlers.
 * 
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
export const protect = async (req, res, next) => {
  let token;

  // 1. Extract Bearer token from Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Header format: "Bearer <token>"
    token = req.headers.authorization.split(' ')[1];
  }

  // 2. Reject immediately if token is missing
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'No token provided, access denied',
    });
  }

  try {
    // 3. Verify token signature and expiration
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Retrieve user from database (or local store in offline mode)
    let currentUser;
    if (mongoose.connection.readyState === 1) {
      currentUser = await User.findById(decoded.id).select('-password');
    } else {
      currentUser = localStore.findUserById(decoded.id);
    }
    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: 'User belonging to this token no longer exists',
      });
    }

    // 5. Verify account is active
    if (!currentUser.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated',
      });
    }

    // 6. Attach verified user to request object
    req.user = currentUser;
    return next();
  } catch (error) {
    // 7. Differentiate expired token error
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired, please login again',
      });
    }

    // 8. Differentiate malformed or invalid token signature
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token is invalid',
      });
    }

    // 9. Forward unexpected errors to the global error handler
    return next(error);
  }
};

export default protect;
