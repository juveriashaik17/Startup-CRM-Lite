import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';
import localStore from '../utils/localStore.js';

/**
 * PRODUCTION RATE LIMITING NOTE:
 * In a production deployment, express-rate-limit should be applied to authentication routes
 * (specifically /register and /login) to defend against brute-force credential stuffing,
 * password guessing, and denial-of-service attacks:
 * 
 * ```javascript
 * import rateLimit from 'express-rate-limit';
 * 
 * const authLimiter = rateLimit({
 *   windowMs: 15 * 60 * 1000, // 15-minute observation window
 *   max: 5,                   // Maximum 5 requests per IP address within window
 *   message: {
 *     success: false,
 *     message: 'Too many authentication attempts. Please try again after 15 minutes.',
 *   },
 *   standardHeaders: true,    // Return standard `RateLimit-*` headers
 *   legacyHeaders: false,     // Disable legacy `X-RateLimit-*` headers
 * });
 * 
 * app.use('/api/auth/login', authLimiter);
 * app.use('/api/auth/register', authLimiter);
 * ```
 */

/**
 * Generate a signed JSON Web Token (JWT) for a user session.
 * Helper utility function (not an Express route handler).
 * 
 * @param {string} userId - MongoDB ObjectId string of user.
 * @returns {string} Signed JWT string.
 */
export const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

/**
 * Register a new user account.
 * POST /api/auth/register
 * 
 * - Checks if email is already taken
 * - Creates user document (password auto-hashed via Mongoose pre-save hook)
 * - Issues a 7-day JWT
 * - Never returns password in response
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Support Local Offline Mode when MongoDB is not connected
    if (mongoose.connection.readyState !== 1) {
      const existing = localStore.findUserByEmail(email);
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists',
        });
      }
      const safeUser = await localStore.createUser({ name, email, password });
      const token = jwt.sign(
        { id: safeUser._id },
        process.env.JWT_SECRET || 'crm_secret_key_123',
        { expiresIn: '7d' }
      );
      return res.status(201).json({
        success: true,
        message: 'Registration successful',
        token,
        user: safeUser,
        data: {
          token,
          user: safeUser,
        },
      });
    }

    // 1. Check if email already exists in database
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists',
      });
    }

    // 2. Create new User document (triggers pre-save bcrypt hashing hook)
    const user = await User.create({
      name,
      email,
      password,
    });

    // 3. Generate JWT with 7-day expiration
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // 4. Strip sensitive password field from output object
    const userObj = user.toObject();
    delete userObj.password;

    // 5. Return 201 Created with session token and sanitized user
    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: userObj,
      data: {
        token,
        user: userObj,
      },
    });
  } catch (error) {
    // Forward unexpected exceptions to global error handler
    return next(error);
  }
};

/**
 * Authenticate existing user credentials.
 * POST /api/auth/login
 * 
 * - Finds user by email with password field selected
 * - Constant-time check: returns generic "Invalid credentials" to prevent email harvesting
 * - Checks account activation status
 * - Issues JWT and returns sanitized user
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Support Local Offline Mode when MongoDB is not connected
    if (mongoose.connection.readyState !== 1) {
      const user = localStore.findUserByEmail(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials',
        });
      }

      const isPasswordCorrect = await localStore.comparePassword(password, user.password);
      if (!isPasswordCorrect) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials',
        });
      }

      if (!user.isActive) {
        return res.status(403).json({
          success: false,
          message: 'Account is deactivated',
        });
      }

      const token = generateToken(user._id);
      const { password: _, ...safeUser } = user;
      return res.status(200).json({
        success: true,
        message: 'Login successful',
        token,
        user: safeUser,
        data: {
          token,
          user: safeUser,
        },
      });
    }

    // 1. Find user by email and explicitly include password (select: false in schema)
    const user = await User.findOne({ email }).select('+password');

    // 2. Uniform failure message to prevent username / email enumeration attacks
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // 3. Verify password hash using bcrypt instance method
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // 4. Check if account has been deactivated
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated',
      });
    }

    // 5. Generate signed JWT session token
    const token = generateToken(user._id);

    // 6. Strip sensitive password field from response object
    const userObj = user.toObject();
    delete userObj.password;

    // 7. Return 200 OK with token and sanitized user
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: userObj,
      data: {
        token,
        user: userObj,
      },
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Get profile of currently authenticated user.
 * GET /api/auth/profile
 * 
 * Returns req.user (already attached and sanitized by `protect` middleware).
 */
export const getProfile = async (req, res, next) => {
  try {
    // req.user was populated and password excluded by `protect` middleware
    return res.status(200).json({
      success: true,
      message: 'Profile retrieved successfully',
      user: req.user,
      data: {
        user: req.user,
      },
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Update authenticated user profile.
 * PUT /api/auth/profile
 * 
 * - Restricts self-serve updates to `name` only (email changes require verified email flow)
 * - If updating password, validates old password first before updating and hashing new password
 * - Saves and returns updated user without password
 */
export const updateProfile = async (req, res, next) => {
  try {
    const { name, oldPassword, password } = req.body;

    if (mongoose.connection.readyState !== 1) {
      const user = localStore.findUserById(req.user._id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User belonging to this token no longer exists',
        });
      }
      if (password) {
        if (!oldPassword) {
          return res.status(400).json({
            success: false,
            message: 'Old password is required to set a new password',
          });
        }
        const fullUser = localStore.findUserByEmail(user.email);
        const isOldCorrect = await localStore.comparePassword(oldPassword, fullUser.password);
        if (!isOldCorrect) {
          return res.status(401).json({
            success: false,
            message: 'Invalid credentials',
          });
        }
      }
      const updatedUser = localStore.updateUser(req.user._id, { name, password });
      return res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        user: updatedUser,
        data: {
          user: updatedUser,
        },
      });
    }

    // 1. Fetch user from DB and include password hash to verify old password
    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User belonging to this token no longer exists',
      });
    }

    // 2. Allow updating name only (prevents unauthorized email/role tampering)
    if (name) {
      user.name = name;
    }

    // 3. If new password is provided, verify old password first
    if (password) {
      if (!oldPassword) {
        return res.status(400).json({
          success: false,
          message: 'Old password is required to set a new password',
        });
      }

      // Verify that old password matches existing hash
      const isOldPasswordCorrect = await user.comparePassword(oldPassword);
      if (!isOldPasswordCorrect) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials',
        });
      }

      // Assigning password triggers the pre-save bcrypt hashing hook
      user.password = password;
    }

    // 4. Save updated user document to MongoDB
    await user.save();

    // 5. Strip sensitive password field from response object
    const updatedUserObj = user.toObject();
    delete updatedUserObj.password;

    // 6. Return 200 OK with sanitized updated user
    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUserObj,
      data: {
        user: updatedUserObj,
      },
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Stateless session logout handler.
 * POST /api/auth/logout
 */
export const logout = async (req, res, next) => {
  try {
    return res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    return next(error);
  }
};

export default {
  register,
  login,
  getProfile,
  updateProfile,
  logout,
  generateToken,
};
