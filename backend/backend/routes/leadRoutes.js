import express from 'express';
import { body } from 'express-validator';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  getLeads,
  createLead,
  getLeadById,
  updateLead,
  updateLeadStatus,
  deleteLead,
  getLeadStats,
  getMonthlyStats,
  searchLeads
} from '../controllers/leadController.js';

const router = express.Router();

// Apply protect middleware to ALL routes in this file
router.use(protect);

// ── Validation Rules ─────────────────────────────────────────────────────────

/**
 * Validation rules for creating or updating a lead.
 */
const leadValidation = [
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters long')
    .trim(),
  body('company')
    .notEmpty()
    .withMessage('Company is required')
    .trim(),
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .trim(),
  body('status')
    .isIn(['New', 'Contacted', 'Meeting Scheduled', 'Proposal Sent', 'Won', 'Lost'])
    .withMessage('Status must be one of: New, Contacted, Meeting Scheduled, Proposal Sent, Won, Lost'),
  body('source')
    .isIn(['Website', 'Referral', 'LinkedIn', 'Cold Call', 'Email Campaign', 'Other'])
    .withMessage('Source must be one of: Website, Referral, LinkedIn, Cold Call, Email Campaign, Other'),
];

/**
 * Validation rules for updating lead status only.
 */
const statusValidation = [
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['New', 'Contacted', 'Meeting Scheduled', 'Proposal Sent', 'Won', 'Lost'])
    .withMessage('Status must be one of: New, Contacted, Meeting Scheduled, Proposal Sent, Won, Lost'),
];

// ── Lead Routes wiring ───────────────────────────────────────────────────────

// NOTE: Static routes must be registered BEFORE dynamic /:id parameter routes 
// to prevent Express routing middleware from matching 'stats' or 'monthly-stats' as an :id parameter.

// @route   GET /api/leads/stats OR /api/leads/stats/summary
// @desc    Get dashboard statistics for leads owned by user
// @access  Private
router.get('/stats', getLeadStats);
router.get('/stats/summary', getLeadStats);

// @route   GET /api/leads/monthly-stats OR /api/leads/stats/monthly
// @desc    Get analytics monthly leads trend for last 6 months
// @access  Private
router.get('/monthly-stats', getMonthlyStats);
router.get('/stats/monthly', getMonthlyStats);

// @route   GET /api/leads/search
// @desc    Autocomplete search leads by keyword across name, company, email
// @access  Private
router.get('/search', searchLeads);

// @route   GET /api/leads
// @desc    Get all leads with filtering, search, and pagination
// @access  Private
router.get('/', getLeads);

// @route   POST /api/leads
// @desc    Create a new lead
// @access  Private
router.post('/', validate(leadValidation), createLead);

// @route   GET /api/leads/:id
// @desc    Get single lead by ID
// @access  Private
router.get('/:id', getLeadById);

// @route   PUT /api/leads/:id
// @desc    Update lead details by ID
// @access  Private
router.put('/:id', validate(leadValidation), updateLead);

// @route   PATCH /api/leads/:id/status
// @desc    Update only lead status by ID
// @access  Private
router.patch('/:id/status', validate(statusValidation), updateLeadStatus);

// @route   DELETE /api/leads/:id
// @desc    Delete lead by ID
// @access  Private
router.delete('/:id', deleteLead);

export default router;
