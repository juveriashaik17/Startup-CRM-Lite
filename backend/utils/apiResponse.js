/**
 * Utility helper functions for standardized, consistent API responses across the CRM backend.
 */

/**
 * Send a standardized success JSON response.
 *
 * @param {Object} res - Express response object.
 * @param {any} data - Payload data to return to client.
 * @param {string} message - Descriptive success message.
 * @param {number} statusCode - HTTP status code (defaults to 200).
 * @returns {Object} JSON response with success, message, and data fields.
 */
export const successResponse = (res, data, message, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * Send a standardized error JSON response.
 *
 * @param {Object} res - Express response object.
 * @param {string} message - Error description message.
 * @param {number} statusCode - HTTP error status code (defaults to 500).
 * @param {any} errors - Detailed validation or field error object (defaults to null).
 * @returns {Object} JSON response with success: false, message, and errors.
 */
export const errorResponse = (res, message, statusCode = 500, errors = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};

/**
 * Send a standardized paginated JSON response for resource collections.
 *
 * @param {Object} res - Express response object.
 * @param {Array} data - List of retrieved records for current page.
 * @param {number} total - Total number of records across all pages.
 * @param {number} page - Current active page number.
 * @param {number} limit - Maximum number of items per page.
 * @returns {Object} JSON response containing data and structured pagination metadata.
 */
export const paginatedResponse = (res, data, total, page, limit, extra = {}) => {
  const totalNum = Number(total);
  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.max(1, Number(limit) || 20);
  const pages = totalNum > 0 ? Math.ceil(totalNum / limitNum) : 0;

  return res.status(200).json({
    success: true,
    data,
    pagination: {
      total: totalNum,
      page: pageNum,
      limit: limitNum,
      pages,
      hasNext: pageNum < pages,
      hasPrev: pageNum > 1,
      ...extra,
    },
  });
};

export default {
  successResponse,
  errorResponse,
  paginatedResponse,
};
