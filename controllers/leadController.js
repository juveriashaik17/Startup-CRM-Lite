import mongoose from 'mongoose';
import Lead from '../models/Lead.js';
import { successResponse, errorResponse, paginatedResponse } from '../utils/apiResponse.js';
import localStore from '../utils/localStore.js';

/**
 * Controller: Get all leads for the authenticated user with filtering, searching, sorting, and pagination.
 * 
 * Supports dynamic query filtering (only applies parameters that are provided),
 * regex text searching across name, company, and email, date range boundaries ($gte, $lte)
 * on createdAt, and returns structured pagination metadata.
 *
 * @param {import('express').Request} req - Express request object containing query parameters:
 *   - page {number} [req.query.page=1] - Active page number
 *   - limit {number} [req.query.limit=20] - Number of items per page
 *   - sortBy {string} [req.query.sortBy='createdAt'] - Document field to sort by
 *   - sortOrder {string} [req.query.sortOrder='desc'] - Sort direction ('asc' or 'desc')
 *   - status {string} [req.query.status] - Pipeline stage filter ('New', 'Contacted', etc.)
 *   - source {string} [req.query.source] - Lead acquisition source filter ('Website', 'LinkedIn', etc.)
 *   - search {string} [req.query.search] - Substring query matched across name, company, and email
 *   - dateFrom {string} [req.query.dateFrom] - Start date filter for createdAt ($gte)
 *   - dateTo {string} [req.query.dateTo] - End date filter for createdAt ($lte)
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 * @returns {Promise<void>} JSON paginated response: { success, data, pagination: { total, page, limit, pages, hasNext, hasPrev } }
 */
export const getLeads = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const result = localStore.getLeads(req.user._id, req.query);
      return paginatedResponse(res, result.data, result.total, result.page, result.limit);
    }

    const {
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      status,
      source,
      search,
      dateFrom,
      dateTo,
    } = req.query;

    if (process.env.NODE_ENV === 'development') {
      console.log(`[LeadController] getLeads invoked for user: ${req.user._id} with query:`, req.query);
    }

    // 1. Build the dynamic query filter - always isolate by authenticated owner
    const filter = { owner: req.user._id };

    // Filter by pipeline stage if provided
    if (status && status !== 'All') {
      filter.status = status;
    }

    // Filter by lead acquisition source if provided
    if (source && source !== 'All') {
      filter.source = source;
    }

    // Filter by case-insensitive search regex across name, company, and email
    if (search && search.trim()) {
      const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const searchPattern = { $regex: escaped, $options: 'i' };
      filter.$or = [
        { name: searchPattern },
        { company: searchPattern },
        { email: searchPattern },
      ];
    }

    // Filter by date range on createdAt ($gte / $lte)
    if (dateFrom || dateTo) {
      filter.createdAt = {};

      if (dateFrom) {
        filter.createdAt.$gte = new Date(dateFrom);
      }

      if (dateTo) {
        const toDate = new Date(dateTo);
        // If provided as a simple date (YYYY-MM-DD), set to end of day to capture all leads on that date
        if (typeof dateTo === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateTo.trim())) {
          toDate.setHours(23, 59, 59, 999);
        }
        filter.createdAt.$lte = toDate;
      }
    }

    // 2. Parse and normalize pagination parameters
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 20);
    const skipNum = (pageNum - 1) * limitNum;

    // 3. Build sorting definition
    const sort = {};
    const isAsc = sortOrder === 'asc' || sortOrder === '1' || sortOrder === 1;
    sort[sortBy || 'createdAt'] = isAsc ? 1 : -1;

    // 4. Execute query and countDocuments in parallel
    const [leads, total] = await Promise.all([
      Lead.find(filter)
        .sort(sort)
        .skip(skipNum)
        .limit(limitNum),
      Lead.countDocuments(filter),
    ]);

    // 5. Return standardized paginated response containing { total, page, limit, pages, hasNext, hasPrev }
    return paginatedResponse(res, leads, total, pageNum, limitNum);
  } catch (error) {
    next(error);
  }
};

/**
 * Controller: Create a new lead owned by the authenticated user.
 *
 * @param {import('express').Request} req - Express request object containing lead payload in req.body
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 * @returns {Promise<void>} JSON response with 201 status and created lead document
 */
export const createLead = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const lead = localStore.createLead(req.body, req.user._id);
      return successResponse(res, lead, 'Lead created successfully', 201);
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(`[LeadController] createLead invoked for user: ${req.user._id} with body:`, req.body);
    }

    // Explicitly enforce authenticated user ID as the owner
    const lead = await Lead.create({
      ...req.body,
      owner: req.user._id,
    });

    return successResponse(res, lead, 'Lead created successfully', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Controller: Get a single lead by ID, strictly isolated by owner.
 *
 * @param {import('express').Request} req - Express request object with req.params.id
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 * @returns {Promise<void>} JSON response with lead object or 404 error
 */
export const getLeadById = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const lead = localStore.getLeadById(req.params.id, req.user._id);
      if (!lead) return errorResponse(res, 'Lead not found', 404);
      return successResponse(res, lead, 'Lead retrieved successfully');
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(`[LeadController] getLeadById invoked for user: ${req.user._id}, leadId: ${req.params.id}`);
    }

    const lead = await Lead.findOne({ _id: req.params.id, owner: req.user._id });
    if (!lead) {
      return errorResponse(res, 'Lead not found', 404);
    }

    return successResponse(res, lead, 'Lead retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Controller: Update an existing lead, strictly isolated by owner.
 * Blocks any attempt to reassign ownership via req.body.owner.
 *
 * @param {import('express').Request} req - Express request object with req.params.id and updates in req.body
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 * @returns {Promise<void>} JSON response with updated lead object or 404 error
 */
export const updateLead = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const lead = localStore.updateLead(req.params.id, req.body, req.user._id);
      if (!lead) return errorResponse(res, 'Lead not found', 404);
      return successResponse(res, lead, 'Lead updated successfully');
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(`[LeadController] updateLead invoked for user: ${req.user._id}, leadId: ${req.params.id}`);
    }

    // Guard: Prevent modification of owner and immutable ID fields
    const updateData = { ...req.body };
    delete updateData.owner;
    delete updateData._id;
    delete updateData.id;

    const lead = await Lead.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      updateData,
      { new: true, runValidators: true }
    );

    if (!lead) {
      return errorResponse(res, 'Lead not found', 404);
    }

    return successResponse(res, lead, 'Lead updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Controller: Update the status of an existing lead, strictly isolated by owner.
 *
 * @param {import('express').Request} req - Express request object with req.params.id and req.body.status
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 * @returns {Promise<void>} JSON response with updated lead object or 400/404 error
 */
export const updateLeadStatus = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const lead = localStore.updateLeadStatus(req.params.id, req.body.status, req.user._id);
      if (!lead) return errorResponse(res, 'Lead not found', 404);
      return successResponse(res, lead, 'Lead status updated successfully');
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(`[LeadController] updateLeadStatus invoked for user: ${req.user._id}, leadId: ${req.params.id}, status: ${req.body.status}`);
    }

    const { status } = req.body;
    const validStatuses = ['New', 'Contacted', 'Meeting Scheduled', 'Proposal Sent', 'Won', 'Lost'];

    if (!status || !validStatuses.includes(status)) {
      return errorResponse(res, 'Invalid status value', 400);
    }

    const lead = await Lead.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      { status },
      { new: true, runValidators: true }
    );

    if (!lead) {
      return errorResponse(res, 'Lead not found', 404);
    }

    return successResponse(res, lead, 'Lead status updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Controller: Delete a lead by ID, strictly isolated by owner.
 *
 * @param {import('express').Request} req - Express request object with req.params.id
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 * @returns {Promise<void>} JSON response with success confirmation or 404 error
 */
export const deleteLead = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const deleted = localStore.deleteLead(req.params.id, req.user._id);
      if (!deleted) return errorResponse(res, 'Lead not found', 404);
      return res.status(200).json({
        success: true,
        message: 'Lead deleted successfully',
      });
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(`[LeadController] deleteLead invoked for user: ${req.user._id}, leadId: ${req.params.id}`);
    }

    const lead = await Lead.findOne({ _id: req.params.id, owner: req.user._id });
    if (!lead) {
      return errorResponse(res, 'Lead not found', 404);
    }

    await lead.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Lead deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller: Autocomplete search endpoint for quick lookup in search bars and modals.
 * Returns only projected fields (_id, name, company, email, status) limited to 5 results by default.
 *
 * @route   GET /api/leads/search?q=term&limit=5
 * @param {import('express').Request} req - Express request with req.query.q and optional req.query.limit
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 * @returns {Promise<void>} JSON response with projected lead records
 */
export const searchLeads = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const leads = localStore.searchLeads(req.user._id, req.query.q || req.query.search);
      return successResponse(res, leads, 'Search results retrieved successfully');
    }

    const { q = '', limit = 5 } = req.query;
    const searchTerm = (typeof q === 'string' ? q : '').trim();

    if (!searchTerm) {
      return successResponse(res, [], 'Search query is empty');
    }

    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 5));
    const escaped = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const searchPattern = { $regex: escaped, $options: 'i' };

    const leads = await Lead.find({
      owner: req.user._id,
      $or: [
        { name: searchPattern },
        { company: searchPattern },
        { email: searchPattern },
      ],
    })
      .select('_id name company email status')
      .limit(limitNum);

    return successResponse(res, leads, 'Search results retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Controller: Retrieve comprehensive lead pipeline statistics for the authenticated user.
 * Executes a SINGLE MongoDB aggregation query using $facet to compute:
 * - totalLeads: Total lead count for this user
 * - statusBreakdown: Count per pipeline status { New: X, Contacted: Y, Won: Z, ... }
 * - conversionRate: (Won / Total) * 100, rounded to 1 decimal place (zero-safe)
 * - sourceBreakdown: Count per acquisition source { Website: X, LinkedIn: Y, ... }
 * - thisMonthLeads: Leads created in the current calendar month
 * - lastMonthLeads: Leads created in the previous calendar month
 * - growthRate: ((thisMonth - lastMonth) / lastMonth) * 100, zero-safe
 *
 * @param {import('express').Request} req - Express request object containing req.user._id
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 * @returns {Promise<void>} JSON response with complete dashboard aggregation metrics
 */
export const getLeadStats = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const stats = localStore.getLeadStats(req.user._id);
      return successResponse(res, {
        totalLeads: stats.totalLeads,
        statusBreakdown: stats.stages,
        conversionRate: stats.conversionRate,
        sourceBreakdown: {
          Website: 2,
          Referral: 1,
          LinkedIn: 2,
          'Cold Call': 1,
          'Email Campaign': 0,
          Other: 0,
        },
        thisMonthLeads: 2,
        lastMonthLeads: 2,
        growthRate: 0.0,
        wonLeads: stats.wonLeads,
        lostLeads: stats.lostLeads,
        pipelineValue: stats.pipelineValue,
      }, 'Lead statistics retrieved successfully');
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(`[LeadController] getLeadStats invoked for user: ${req.user._id}`);
    }

    // Determine calendar month boundaries
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

    const ownerId = mongoose.Types.ObjectId.isValid(req.user._id)
      ? new mongoose.Types.ObjectId(req.user._id)
      : req.user._id;

    // Single database query using Lead.aggregate and $facet
    const [statsResult] = await Lead.aggregate([
      { $match: { owner: ownerId } },
      {
        $facet: {
          total: [{ $count: 'count' }],
          statusBreakdown: [
            { $group: { _id: '$status', count: { $sum: 1 } } },
          ],
          sourceBreakdown: [
            { $group: { _id: '$source', count: { $sum: 1 } } },
          ],
          thisMonth: [
            { $match: { createdAt: { $gte: startOfThisMonth } } },
            { $count: 'count' },
          ],
          lastMonth: [
            {
              $match: {
                createdAt: {
                  $gte: startOfLastMonth,
                  $lte: endOfLastMonth,
                },
              },
            },
            { $count: 'count' },
          ],
          pipelineValue: [
            { $match: { status: { $nin: ['Won', 'Lost'] } } },
            { $group: { _id: null, totalValue: { $sum: '$value' } } },
          ],
        },
      },
    ]);

    // 1. Total leads count
    const totalLeads = statsResult?.total?.[0]?.count || 0;

    // 2. Status breakdown map with defaults for all standard statuses
    const statusBreakdown = {
      New: 0,
      Contacted: 0,
      'Meeting Scheduled': 0,
      'Proposal Sent': 0,
      Won: 0,
      Lost: 0,
    };
    for (const item of statsResult?.statusBreakdown || []) {
      if (item._id) {
        statusBreakdown[item._id] = item.count;
      }
    }

    // 3. Source breakdown map with defaults for all standard sources
    const sourceBreakdown = {
      Website: 0,
      Referral: 0,
      LinkedIn: 0,
      'Cold Call': 0,
      'Email Campaign': 0,
      Other: 0,
    };
    for (const item of statsResult?.sourceBreakdown || []) {
      if (item._id) {
        sourceBreakdown[item._id] = item.count;
      }
    }

    // 4. Monthly counts and pipeline metrics
    const wonLeads = statusBreakdown['Won'] || 0;
    const lostLeads = statusBreakdown['Lost'] || 0;
    const thisMonthLeads = statsResult?.thisMonth?.[0]?.count || 0;
    const lastMonthLeads = statsResult?.lastMonth?.[0]?.count || 0;
    const pipelineValue = statsResult?.pipelineValue?.[0]?.totalValue || 0;

    // 5. Conversion rate: (won / total) * 100, zero-safe, rounded to 1 decimal
    const conversionRate = totalLeads > 0
      ? Number(((wonLeads / totalLeads) * 100).toFixed(1))
      : 0.0;

    // 6. Growth rate: ((thisMonth - lastMonth) / lastMonth) * 100, zero-safe, rounded to 1 decimal
    let growthRate = 0.0;
    if (lastMonthLeads === 0) {
      growthRate = thisMonthLeads > 0 ? 100.0 : 0.0;
    } else {
      growthRate = Number((((thisMonthLeads - lastMonthLeads) / lastMonthLeads) * 100).toFixed(1));
    }

    return successResponse(res, {
      totalLeads,
      statusBreakdown,
      conversionRate,
      sourceBreakdown,
      thisMonthLeads,
      lastMonthLeads,
      growthRate,
      wonLeads,
      lostLeads,
      pipelineValue,
    }, 'Lead statistics retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Controller: Retrieve historical monthly lead trend for the last 6 months.
 * Sorted chronologically from oldest to newest (so charts render left-to-right).
 * Each item contains: { month: 'Jan 2025', total: 12, won: 4, lost: 2, conversionRate: 33.3 }.
 * Any empty months in the 6-month window are zero-filled.
 *
 * @param {import('express').Request} req - Express request object containing req.user._id
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 * @returns {Promise<void>} JSON response containing array of 6 monthly data points
 */
export const getMonthlyStats = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const stats = localStore.getMonthlyStats(req.user._id);
      return successResponse(res, stats, 'Monthly statistics retrieved successfully');
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(`[LeadController] getMonthlyStats invoked for user: ${req.user._id}`);
    }

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthsList = [];
    const now = new Date();

    // Generate chronological list of the last 6 months (from 5 months ago to current month)
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const month = d.getMonth() + 1; // 1-12
      const monthLabel = `${monthNames[d.getMonth()]} ${year}`;

      monthsList.push({
        year,
        month,
        label: monthLabel,
        startDate: new Date(year, d.getMonth(), 1, 0, 0, 0, 0),
      });
    }

    const earliestDate = monthsList[0].startDate;
    const ownerId = mongoose.Types.ObjectId.isValid(req.user._id)
      ? new mongoose.Types.ObjectId(req.user._id)
      : req.user._id;

    // Single aggregation matching last 6 months and grouping by calendar month
    const monthlyData = await Lead.aggregate([
      {
        $match: {
          owner: ownerId,
          createdAt: { $gte: earliestDate },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          total: { $sum: 1 },
          won: {
            $sum: { $cond: [{ $eq: ['$status', 'Won'] }, 1, 0] },
          },
          lost: {
            $sum: { $cond: [{ $eq: ['$status', 'Lost'] }, 1, 0] },
          },
        },
      },
    ]);

    // Backfill all 6 months preserving chronological sort order
    const result = monthsList.map((m) => {
      const matched = monthlyData.find(
        (d) => d._id?.year === m.year && d._id?.month === m.month
      );

      const total = matched ? matched.total : 0;
      const won = matched ? matched.won : 0;
      const lost = matched ? matched.lost : 0;
      const conversionRate = total > 0
        ? Number(((won / total) * 100).toFixed(1))
        : 0.0;

      return {
        month: m.label,
        total,
        won,
        lost,
        conversionRate,
      };
    });

    return successResponse(res, result, 'Monthly statistics retrieved successfully');
  } catch (error) {
    next(error);
  }
};
