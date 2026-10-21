import mongoose from 'mongoose';

/**
 * Lead Schema Definition
 * Represents a business lead/prospect inside Startup CRM Lite.
 * Associated with a specific user (owner isolation).
 */
const leadSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide the lead name'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long'],
  },
  company: {
    type: String,
    required: [true, 'Please provide the company name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please provide the email address'],
    lowercase: true,
    trim: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  value: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: {
      values: ['New', 'Contacted', 'Meeting Scheduled', 'Proposal Sent', 'Won', 'Lost'],
      message: '{VALUE} is not a valid status stage',
    },
    default: 'New',
  },
  source: {
    type: String,
    enum: {
      values: ['Website', 'Referral', 'LinkedIn', 'Cold Call', 'Email Campaign', 'Other'],
      message: '{VALUE} is not a valid acquisition source',
    },
    default: 'Other',
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'A lead must belong to a user'],
  },
}, {
  timestamps: true, // Automatically manages createdAt and updatedAt fields
});

// ============================================================================
// COMPOUND INDEXES FOR ADVANCED QUERY PATTERNS & AGGREGATIONS
// ============================================================================

// 1. Primary index for user-isolated chronological sorting, pagination, and date range filters
leadSchema.index({ owner: 1, createdAt: -1 });

// 2. Index for filtering and aggregations by pipeline status stage
leadSchema.index({ owner: 1, status: 1 });

// 3. Index for filtering and aggregations by acquisition source
leadSchema.index({ owner: 1, source: 1 });

// 4. Index for user-isolated autocomplete and regex lookups by contact name
leadSchema.index({ owner: 1, name: 1 });

// 5. Index for user-isolated company name lookups
leadSchema.index({ owner: 1, company: 1 });

// 6. Index for user-isolated email address lookups
leadSchema.index({ owner: 1, email: 1 });

const Lead = mongoose.model('Lead', leadSchema);

export default Lead;
