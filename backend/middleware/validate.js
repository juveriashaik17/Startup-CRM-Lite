import { validationResult } from 'express-validator';

/**
 * Validation Runner Middleware
 * 
 * Higher-order middleware factory that accepts an array of express-validator
 * validation chains, runs them concurrently against the incoming request,
 * and standardizes error responses if validation failures occur.
 * 
 * @param {Array} validations - Array of express-validator validation rules.
 * @returns {Function} Express middleware handler.
 */
export const validate = (validations) => {
  return async (req, res, next) => {
    // 1. Execute all validation chains concurrently across the request
    await Promise.all(validations.map((validation) => validation.run(req)));

    // 2. Extract validation results
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    // 3. Format errors to match { success: false, errors: [{ field, message }] }
    const formattedErrors = errors.array().map((err) => ({
      field: err.path || err.param, // Express-validator v7 uses 'path', v6 uses 'param'
      message: err.msg,
    }));

    // 4. Return 400 Bad Request with standardized errors list
    return res.status(400).json({
      success: false,
      errors: formattedErrors,
    });
  };
};

export default validate;
