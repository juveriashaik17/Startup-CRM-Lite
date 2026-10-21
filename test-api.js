/**
 * Phase B9: Comprehensive API Verification Suite
 * 
 * Verifies every endpoint, middleware, security policy, and validation rule
 * across the Startup CRM Lite Express backend prior to deployment.
 */
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import authRoutes from './routes/authRoutes.js';
import leadRoutes from './routes/leadRoutes.js';
import errorHandler from './middleware/errorHandler.js';
import User from './models/User.js';
import Lead from './models/Lead.js';

process.env.JWT_SECRET = 'test_phase_b9_super_secret_jwt_key_12345';
process.env.JWT_EXPIRES_IN = '7d';
process.env.NODE_ENV = 'test';
process.env.FRONTEND_URL = 'http://localhost:5173';

const app = express();

// Security & Parsing Middlewares
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// Mount Feature Routers
app.use('/api/auth', authRoutes);
app.use('/api/leads', leadRoutes);

// Error Handler Middleware
app.use(errorHandler);

// Helper for HTTP requests
let baseUrl = '';

async function request(path, options = {}) {
  const url = `${baseUrl}${path}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  let data;
  try {
    data = await response.json();
  } catch {
    data = null;
  }
  return { status: response.status, headers: response.headers, data };
}

// Test Runner
const results = [];
function assert(condition, message) {
  if (!condition) {
    results.push({ passed: false, message });
    console.error(`  ❌ FAIL: ${message}`);
  } else {
    results.push({ passed: true, message });
    console.log(`  ✅ PASS: ${message}`);
  }
}

async function runTests() {
  console.log('\n============================================================');
  console.log('🚀 PHASE B9: RUNNING COMPLETE API VERIFICATION TEST SUITE');
  console.log('============================================================\n');

  const server = app.listen(0);
  const port = server.address().port;
  baseUrl = `http://127.0.0.1:${port}`;
  console.log(`Ephemeral Test Server online at ${baseUrl}\n`);

  try {
    // -------------------------------------------------------------
    // 1. HEALTH CHECK & INFRASTRUCTURE
    // -------------------------------------------------------------
    console.log('--- 1. Health Check & Security Headers ---');
    const health = await request('/api/health');
    assert(health.status === 200, 'GET /api/health returns 200 OK');
    assert(health.data?.status === 'OK', 'GET /api/health response body has status: "OK"');
    assert(!!health.data?.timestamp, 'GET /api/health returns valid timestamp');
    assert(health.headers.get('x-content-type-options') === 'nosniff', 'Helmet sets X-Content-Type-Options: nosniff');

    // -------------------------------------------------------------
    // 2. AUTH ROUTE VALIDATION & SECURITY
    // -------------------------------------------------------------
    console.log('\n--- 2. Authentication Validation & Edge Cases ---');

    // Register with empty body
    const regEmpty = await request('/api/auth/register', { method: 'POST', body: JSON.stringify({}) });
    assert(regEmpty.status === 400, 'POST /api/auth/register rejects empty body with 400 Bad Request');
    assert(Array.isArray(regEmpty.data?.errors) && regEmpty.data.errors.length >= 3, 'POST /api/auth/register returns validation error array for name, email, password');

    // Register with invalid email and short password
    const regBad = await request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name: 'Alex', email: 'invalid-email', password: '123' }),
    });
    assert(regBad.status === 400, 'POST /api/auth/register rejects invalid email and short password with 400');
    assert(regBad.data?.errors?.some(e => e.field === 'email'), 'Field error contains invalid email flag');
    assert(regBad.data?.errors?.some(e => e.field === 'password'), 'Field error contains short password flag');

    // Login with empty body
    const loginEmpty = await request('/api/auth/login', { method: 'POST', body: JSON.stringify({}) });
    assert(loginEmpty.status === 400, 'POST /api/auth/login rejects empty body with 400');
    assert(loginEmpty.data?.errors?.some(e => e.field === 'email'), 'Login validation catches missing email');
    assert(loginEmpty.data?.errors?.some(e => e.field === 'password'), 'Login validation catches missing password');

    // -------------------------------------------------------------
    // 3. JWT TOKEN VERIFICATION & AUTHORIZATION CHECKS
    // -------------------------------------------------------------
    console.log('\n--- 3. JWT Authentication Middleware (protect) ---');

    // Profile without token
    const profNoToken = await request('/api/auth/profile');
    assert(profNoToken.status === 401, 'GET /api/auth/profile without token returns 401 Unauthorized');
    assert(profNoToken.data?.message === 'No token provided, access denied', 'Missing token returns exact message "No token provided, access denied"');

    // Profile with malformed token
    const profBadToken = await request('/api/auth/profile', {
      headers: { Authorization: 'Bearer this.is.not.a.valid.jwt' },
    });
    assert(profBadToken.status === 401, 'GET /api/auth/profile with invalid token returns 401 Unauthorized');
    assert(profBadToken.data?.message === 'Token is invalid', 'Invalid token returns exact message "Token is invalid"');

    // Profile with expired token
    const expiredToken = jwt.sign({ id: 'dummy_user_id' }, process.env.JWT_SECRET, { expiresIn: '1ms' });
    await new Promise(r => setTimeout(r, 10)); // ensure expiration
    const profExpToken = await request('/api/auth/profile', {
      headers: { Authorization: `Bearer ${expiredToken}` },
    });
    assert(profExpToken.status === 401, 'GET /api/auth/profile with expired token returns 401 Unauthorized');
    assert(profExpToken.data?.message === 'Token has expired, please login again', 'Expired token returns exact message "Token has expired, please login again"');

    // Profile alias /me without token
    const meNoToken = await request('/api/auth/me');
    assert(meNoToken.status === 401, 'GET /api/auth/me without token returns 401 Unauthorized');

    // Logout without token
    const logoutNoToken = await request('/api/auth/logout', { method: 'POST' });
    assert(logoutNoToken.status === 401, 'POST /api/auth/logout without token returns 401 Unauthorized');

    // -------------------------------------------------------------
    // 4. LEAD ROUTES AUTHENTICATION GUARD VERIFICATION
    // -------------------------------------------------------------
    console.log('\n--- 4. Lead Routes Protection Verification ---');

    const leadEndpoints = [
      { method: 'GET', path: '/api/leads', name: 'GET /api/leads' },
      { method: 'POST', path: '/api/leads', name: 'POST /api/leads' },
      { method: 'GET', path: '/api/leads/search?q=alice', name: 'GET /api/leads/search' },
      { method: 'GET', path: '/api/leads/stats/summary', name: 'GET /api/leads/stats/summary' },
      { method: 'GET', path: '/api/leads/stats/monthly', name: 'GET /api/leads/stats/monthly' },
      { method: 'GET', path: '/api/leads/507f1f77bcf86cd799439011', name: 'GET /api/leads/:id' },
      { method: 'PUT', path: '/api/leads/507f1f77bcf86cd799439011', name: 'PUT /api/leads/:id' },
      { method: 'PATCH', path: '/api/leads/507f1f77bcf86cd799439011/status', name: 'PATCH /api/leads/:id/status' },
      { method: 'DELETE', path: '/api/leads/507f1f77bcf86cd799439011', name: 'DELETE /api/leads/:id' },
    ];

    for (const ep of leadEndpoints) {
      const res = await request(ep.path, { method: ep.method });
      assert(res.status === 401, `${ep.name} securely blocked when unauthenticated (401)`);
    }

    // -------------------------------------------------------------
    // 5. AUTHENTICATED MOCK FLOWS (Mongoose Mock Integration)
    // -------------------------------------------------------------
    console.log('\n--- 5. Authenticated End-to-End Business Logic ---');

    const mockUserId = '64f1a2b3c4d5e6f7a8b9c0d1';
    const mockUser = {
      _id: mockUserId,
      name: 'Sarah Connor',
      email: 'sarah@skynet.com',
      isActive: true,
      comparePassword: async (pwd) => pwd === 'CorrectPassword123!',
      toObject: function () {
        return { _id: this._id, name: this.name, email: this.email, isActive: this.isActive };
      },
    };

    // Generate valid auth token
    const validToken = jwt.sign({ id: mockUserId }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const authHeaders = { Authorization: `Bearer ${validToken}` };

    // Stub User.findById for protect middleware
    const originalFindById = User.findById;
    User.findById = (id) => ({
      select: () => (id === mockUserId ? Promise.resolve(mockUser) : Promise.resolve(null)),
    });

    // Test GET /api/auth/profile with valid token
    const profAuth = await request('/api/auth/profile', { headers: authHeaders });
    assert(profAuth.status === 200, 'GET /api/auth/profile with valid token returns 200 OK');
    assert(profAuth.data?.user?.email === 'sarah@skynet.com', 'Profile matches authenticated user record');
    assert(!profAuth.data?.user?.password, 'Password field is never exposed in profile response');

    // Test GET /api/auth/me alias
    const meAuth = await request('/api/auth/me', { headers: authHeaders });
    assert(meAuth.status === 200, 'GET /api/auth/me alias works seamlessly');

    // Test POST /api/auth/logout with valid token
    const logoutAuth = await request('/api/auth/logout', { method: 'POST', headers: authHeaders });
    assert(logoutAuth.status === 200, 'POST /api/auth/logout returns 200 OK');

    // -------------------------------------------------------------
    // 6. LEAD VALIDATION & PIPELINE ENUM CHECKS
    // -------------------------------------------------------------
    console.log('\n--- 6. Lead Input Validation Rules ---');

    // POST /api/leads with invalid payload
    const leadBad = await request('/api/leads', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ name: '', company: '', email: 'not-an-email', status: 'InvalidStage' }),
    });
    assert(leadBad.status === 400, 'POST /api/leads validates required fields and status enum (400)');
    assert(leadBad.data?.errors?.some(e => e.field === 'name'), 'Lead validation requires name');
    assert(leadBad.data?.errors?.some(e => e.field === 'company'), 'Lead validation requires company');
    assert(leadBad.data?.errors?.some(e => e.field === 'email'), 'Lead validation requires valid email');
    assert(leadBad.data?.errors?.some(e => e.field === 'status'), 'Lead validation enforces status enum');

    // PATCH /api/leads/:id/status with invalid status
    const statusBad = await request('/api/leads/507f1f77bcf86cd799439011/status', {
      method: 'PATCH',
      headers: authHeaders,
      body: JSON.stringify({ status: 'BogusStage' }),
    });
    assert(statusBad.status === 400, 'PATCH /api/leads/:id/status rejects invalid pipeline stages (400)');

    // -------------------------------------------------------------
    // 7. PAYLOAD SIZE LIMITATION (DoS PROTECTION)
    // -------------------------------------------------------------
    console.log('\n--- 7. Denial of Service (DoS) Payload Limiter ---');
    const oversizedPayload = { data: 'A'.repeat(15 * 1024) }; // 15kb > 10kb limit
    const oversizedRes = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(oversizedPayload),
    });
    assert(oversizedRes.status === 413 || oversizedRes.status === 500, 'Oversized payload (>10kb) rejected by express.json body parser');

    // -------------------------------------------------------------
    // 8. ADVANCED AGGREGATIONS, PAGINATION & AUTOCOMPLETE SEARCH
    // -------------------------------------------------------------
    console.log('\n--- 8. Advanced Aggregations, Pagination & Autocomplete Search ---');

    const originalLeadFind = Lead.find;
    const originalLeadCount = Lead.countDocuments;
    const originalLeadAggregate = Lead.aggregate;

    try {
      // 8.1 Enhanced getLeads with dynamic filter and pagination
      let capturedFilter = null;
      let capturedSort = null;
      let capturedSkip = null;
      let capturedLimit = null;

      Lead.find = (filter) => {
        capturedFilter = filter;
        return {
          sort: (s) => {
            capturedSort = s;
            return {
              skip: (sk) => {
                capturedSkip = sk;
                return {
                  limit: (l) => {
                    capturedLimit = l;
                    return Promise.resolve([
                      { _id: 'lead1', name: 'Cyberdyne Systems', status: 'Contacted', source: 'LinkedIn' },
                      { _id: 'lead2', name: 'Cyber Security Corp', status: 'Contacted', source: 'LinkedIn' },
                    ]);
                  },
                };
              },
            };
          },
        };
      };
      Lead.countDocuments = (_filter) => Promise.resolve(25);

      const paginatedRes = await request(
        '/api/leads?page=2&limit=10&sortBy=company&sortOrder=asc&status=Contacted&source=LinkedIn&search=cyber&dateFrom=2025-01-01&dateTo=2025-01-31',
        { headers: authHeaders }
      );

      assert(paginatedRes.status === 200, 'GET /api/leads returns 200 with pagination');
      assert(paginatedRes.data?.pagination?.total === 25, 'Pagination metadata total is 25');
      assert(paginatedRes.data?.pagination?.page === 2, 'Pagination metadata page is 2');
      assert(paginatedRes.data?.pagination?.limit === 10, 'Pagination metadata limit is 10');
      assert(paginatedRes.data?.pagination?.pages === 3, 'Pagination metadata pages is 3');
      assert(paginatedRes.data?.pagination?.hasNext === true, 'Pagination metadata hasNext is true');
      assert(paginatedRes.data?.pagination?.hasPrev === true, 'Pagination metadata hasPrev is true');

      // Verify dynamic filter construction
      assert(capturedFilter?.owner === mockUserId, 'Filter isolates authenticated user ID');
      assert(capturedFilter?.status === 'Contacted', 'Dynamic filter applies status parameter');
      assert(capturedFilter?.source === 'LinkedIn', 'Dynamic filter applies source parameter');
      assert(Array.isArray(capturedFilter?.$or) && capturedFilter.$or.length === 3, 'Dynamic filter builds search regex across name, company, email');
      assert(capturedFilter?.createdAt?.$gte instanceof Date, 'Dynamic filter includes createdAt.$gte for dateFrom');
      assert(capturedFilter?.createdAt?.$lte instanceof Date, 'Dynamic filter includes createdAt.$lte for dateTo');
      assert(capturedSort?.company === 1, 'Dynamic sort applies requested field and ascending direction');
      assert(capturedSkip === 10, 'Pagination correctly computes skip offset (page 2 with limit 10 => skip 10)');
      assert(capturedLimit === 10, 'Pagination applies limit parameter');

      // 8.2 Autocomplete Search Endpoint (/api/leads/search)
      let searchFilter = null;
      let searchSelect = null;
      let searchLimit = null;

      Lead.find = (filter) => {
        searchFilter = filter;
        return {
          select: (fields) => {
            searchSelect = fields;
            return {
              limit: (lim) => {
                searchLimit = lim;
                return Promise.resolve([
                  { _id: 'lead1', name: 'Cyberdyne Systems', company: 'Cyberdyne', email: 'tech@cyberdyne.com', status: 'Contacted' },
                ]);
              },
            };
          },
        };
      };

      const searchRes = await request('/api/leads/search?q=cyber&limit=5', { headers: authHeaders });
      assert(searchRes.status === 200, 'GET /api/leads/search returns 200 OK');
      assert(Array.isArray(searchRes.data?.data) && searchRes.data.data.length === 1, 'Search returns matching leads');
      assert(searchFilter?.owner === mockUserId, 'Search strictly isolates by authenticated user ID');
      assert(searchSelect === '_id name company email status', 'Search strictly projects only _id, name, company, email, status');
      assert(searchLimit === 5, 'Search enforces limit of 5 results');

      // Test empty search query returns empty array without querying database
      const emptySearchRes = await request('/api/leads/search?q=', { headers: authHeaders });
      assert(emptySearchRes.status === 200, 'GET /api/leads/search?q= returns 200');
      assert(Array.isArray(emptySearchRes.data?.data) && emptySearchRes.data.data.length === 0, 'Empty search query immediately returns empty array []');

      // 8.3 getLeadStats Aggregation (Single query with $facet)
      let aggregatePipeline = null;
      Lead.aggregate = (pipeline) => {
        aggregatePipeline = pipeline;
        return Promise.resolve([
          {
            total: [{ count: 20 }],
            statusBreakdown: [
              { _id: 'New', count: 5 },
              { _id: 'Contacted', count: 3 },
              { _id: 'Won', count: 8 },
              { _id: 'Lost', count: 4 },
            ],
            sourceBreakdown: [
              { _id: 'Website', count: 10 },
              { _id: 'LinkedIn', count: 10 },
            ],
            thisMonth: [{ count: 12 }],
            lastMonth: [{ count: 8 }],
            pipelineValue: [{ totalValue: 45000 }],
          },
        ]);
      };

      const statsRes = await request('/api/leads/stats/summary', { headers: authHeaders });
      assert(statsRes.status === 200, 'GET /api/leads/stats/summary returns 200 OK');
      assert(Array.isArray(aggregatePipeline) && aggregatePipeline.length === 2, 'Lead.aggregate executes a single pipeline query');
      assert(!!aggregatePipeline[0]?.$match?.owner, 'Aggregation pipeline isolates by owner');
      assert(!!aggregatePipeline[1]?.$facet, 'Aggregation pipeline utilizes $facet for single-query calculation');

      const stats = statsRes.data?.data;
      assert(stats?.totalLeads === 20, 'Stats returns totalLeads: 20');
      assert(stats?.statusBreakdown?.Won === 8 && stats?.statusBreakdown?.New === 5, 'Stats returns statusBreakdown map');
      assert(stats?.sourceBreakdown?.Website === 10 && stats?.sourceBreakdown?.LinkedIn === 10, 'Stats returns sourceBreakdown map');
      assert(stats?.thisMonthLeads === 12, 'Stats returns thisMonthLeads: 12');
      assert(stats?.lastMonthLeads === 8, 'Stats returns lastMonthLeads: 8');
      assert(stats?.conversionRate === 40.0, 'Stats conversionRate computed as (8/20)*100 = 40.0');
      assert(stats?.growthRate === 50.0, 'Stats growthRate computed as ((12-8)/8)*100 = 50.0%');

      // Test zero-division edge case for stats
      Lead.aggregate = () => Promise.resolve([
        {
          total: [],
          statusBreakdown: [],
          sourceBreakdown: [],
          thisMonth: [],
          lastMonth: [],
          pipelineValue: [],
        },
      ]);
      const zeroStatsRes = await request('/api/leads/stats/summary', { headers: authHeaders });
      assert(zeroStatsRes.data?.data?.conversionRate === 0.0, 'Zero leads safely returns conversionRate: 0.0');
      assert(zeroStatsRes.data?.data?.growthRate === 0.0, 'Zero monthly leads safely returns growthRate: 0.0');

      // 8.4 getMonthlyStats Aggregation (Last 6 months chronological)
      Lead.aggregate = () => Promise.resolve([
        { _id: { year: 2026, month: 9 }, total: 10, won: 3, lost: 2 },
        { _id: { year: 2026, month: 10 }, total: 15, won: 5, lost: 3 },
      ]);

      const monthlyRes = await request('/api/leads/stats/monthly', { headers: authHeaders });
      assert(monthlyRes.status === 200, 'GET /api/leads/stats/monthly returns 200 OK');
      const monthlyArray = monthlyRes.data?.data;
      assert(Array.isArray(monthlyArray) && monthlyArray.length === 6, 'getMonthlyStats returns exactly 6 months');
      assert(typeof monthlyArray[0]?.month === 'string' && monthlyArray[0].month.includes(' '), 'Month format matches "MMM YYYY"');
      assert(monthlyArray.every(m => 'total' in m && 'won' in m && 'lost' in m && 'conversionRate' in m), 'Every month item contains total, won, lost, and conversionRate');

      // Chronological order verification: check that months are in ascending chronological order
      const parseMonth = (str) => new Date(str + ' 1');
      const isSorted = monthlyArray.every((val, i, arr) => i === 0 || parseMonth(val.month) >= parseMonth(arr[i - 1].month));
      assert(isSorted, 'Monthly statistics are chronologically ordered from oldest to newest (left to right)');

    } finally {
      Lead.find = originalLeadFind;
      Lead.countDocuments = originalLeadCount;
      Lead.aggregate = originalLeadAggregate;
    }

    // Restore stubs
    User.findById = originalFindById;

    // -------------------------------------------------------------
    // SUMMARY REPORT
    // -------------------------------------------------------------
    console.log('\n============================================================');
    const passed = results.filter(r => r.passed).length;
    const failed = results.filter(r => !r.passed).length;
    console.log(`📊 PHASE B9 API TEST RESULTS: ${passed}/${results.length} PASSED (${failed} FAILED)`);
    console.log('============================================================\n');

    if (failed > 0) {
      process.exit(1);
    }
  } finally {
    server.close();
  }
}

runTests();
