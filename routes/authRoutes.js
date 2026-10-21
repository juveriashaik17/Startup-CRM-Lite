import express from 'express';
import { body } from 'express-validator';
import {
  register,
  login,
  getProfile,
  updateProfile,
  logout,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

/**
 * PRODUCTION RATE LIMITING NOTE:
 * In production environments, apply express-rate-limit to authentication routes
 * to mitigate brute-force password guessing and credential stuffing attacks:
 * 
 * ```javascript
 * import rateLimit from 'express-rate-limit';
 * 
 * const authLimiter = rateLimit({
 *   windowMs: 15 * 60 * 1000, // 15-minute window
 *   max: 5,                   // Maximum 5 failed attempts per IP per window
 *   message: {
 *     success: false,
 *     message: 'Too many authentication attempts. Please try again after 15 minutes.',
 *   },
 *   standardHeaders: true,    // Return standard `RateLimit-*` headers
 *   legacyHeaders: false,     // Disable legacy `X-RateLimit-*` headers
 * });
 * 
 * router.use('/login', authLimiter);
 * router.use('/register', authLimiter);
 * ```
 */

// ============================================================================
// 1. VALIDATION RULES
// ============================================================================

/**
 * Validation rules for user registration.
 * Validates name is provided, email is valid & normalized, password >= 6 chars.
 */
const registerValidation = [
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .trim(),
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .trim(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
];

/**
 * Validation rules for user login.
 * Validates email is formatted properly and password is non-empty.
 */
const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .trim(),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

/**
 * Validation rules for profile updates.
 * Optional name check, optional password change with old password verification.
 */
const updateProfileValidation = [
  body('name')
    .optional()
    .notEmpty()
    .withMessage('Name cannot be empty')
    .trim(),
  body('password')
    .optional()
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long'),
  body('oldPassword')
    .optional()
    .notEmpty()
    .withMessage('Old password is required to update to a new password'),
];

// ============================================================================
// 2. ROUTE REGISTRATIONS
// ============================================================================

// 1. POST /api/auth/register - Register a new user
router.post('/register', validate(registerValidation), register);

// 2. POST /api/auth/login - Authenticate credentials and receive token
router.post('/login', validate(loginValidation), login);

// 3. GET /api/auth/profile - Retrieve authenticated user profile
router.get('/profile', protect, getProfile);

// Canonical alias: GET /api/auth/me - Retrieve authenticated user profile
router.get('/me', protect, getProfile);

// 4. PUT /api/auth/profile - Update authenticated user profile details
router.put('/profile', protect, validate(updateProfileValidation), updateProfile);

// 5. POST /api/auth/logout - Invalidate user session (client clears token)
router.post('/logout', protect, logout);

export default router;
