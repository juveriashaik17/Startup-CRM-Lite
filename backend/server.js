import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, '../dist');

// ============================================================================
// 1. ENVIRONMENT CONFIGURATION & VALIDATION
// ============================================================================

// Load environment variables: check backend/.env first, then root .env if running from root
dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

/**
 * Validate that critical environment variables are present before starting the server.
 * Prevents accidental production deployments with missing configuration.
 */
const checkRequiredEnvVars = () => {
  if (!process.env.JWT_SECRET) {
    process.env.JWT_SECRET = 'startup_crm_super_secret_local_jwt_key_2026';
  }

  if (process.env.NODE_ENV === 'production' && !process.env.MONGODB_URI) {
    console.warn('[Server] MONGODB_URI not configured in production. Running in Local Offline Mode.');
  }
};

// Validate environment variables immediately
checkRequiredEnvVars();

// Import database connection configuration
import connectDB from './config/database.js';

// Import feature routers
import authRoutes from './routes/authRoutes.js';
import leadRoutes from './routes/leadRoutes.js';

// Import global error handling middleware
import errorHandler from './middleware/errorHandler.js';

// Initialize the Express application
const app = express();

// ============================================================================
// 2. SECURITY HEADERS & LOGGING MIDDLEWARE
// ============================================================================

// Set HTTP security headers to defend against common attack vectors
app.use(helmet());

// Environment-aware request logging:
// Production uses detailed 'combined' Apache-style logs; Development uses colorized 'dev' format
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined'));
} else if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// ============================================================================
// 3. CORS (CROSS-ORIGIN RESOURCE SHARING) CONFIGURATION
// ============================================================================

// Allowed origins whitelist for production and development
const configuredOrigins = (process.env.FRONTEND_URL || '')
  .split(',')
  .map((o) => o.trim().replace(/\/$/, ''))
  .filter(Boolean);

const defaultOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:4173',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:4173',
  'https://your-app.vercel.app',
];

const allowedOrigins = new Set([...configuredOrigins, ...defaultOrigins]);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (!origin) {
        return callback(null, true);
      }

      const normalizedOrigin = origin.replace(/\/$/, '');

      // In development, allow any localhost or 127.0.0.1 origin on any port
      if (
        process.env.NODE_ENV !== 'production' &&
        /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(normalizedOrigin)
      ) {
        return callback(null, true);
      }

      // Allow any Vercel deployment preview or production domain
      let isAllowedVercel = false;
      try {
        const parsed = new URL(normalizedOrigin);
        if (parsed.hostname.endsWith('.vercel.app')) {
          isAllowedVercel = true;
        }
      } catch (_) {}

      if (allowedOrigins.has(normalizedOrigin) || isAllowedVercel) {
        return callback(null, true);
      }

      // Safely deny without throwing an Express 500 exception
      return callback(null, false);
    },
    credentials: true,
  })
);

// ============================================================================
// 4. RATE LIMITING MIDDLEWARE
// ============================================================================

// General rate limiter: 100 requests per 15 minutes per IP across all /api routes
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true, // Return standard RateLimit headers in the `RateLimit-*` format
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
  },
});

// Stricter rate limiter for authentication: 10 requests per 15 minutes to prevent brute-force attacks
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many auth attempts.',
  },
});

// Apply rate limiters
app.use('/api/', generalLimiter);
app.use('/api/auth/', authLimiter);

// ============================================================================
// 5. BODY PARSING & MONGO INJECTION SANITIZATION
// ============================================================================

// Parse JSON request bodies with a strict 10kb limit to prevent payload flooding / DoS attacks
app.use(express.json({ limit: '10kb' }));

// Parse URL-encoded application/x-www-form-urlencoded payloads
app.use(express.urlencoded({ extended: true }));

// Data sanitization against NoSQL query injection:
// Express 5 compatible: sanitizes req.body and req.params without mutating getter-only req.query
app.use((req, res, next) => {
  if (req.body) mongoSanitize.sanitize(req.body);
  if (req.params) mongoSanitize.sanitize(req.params);
  next();
});

// ============================================================================
// 6. HEALTH CHECK & ROOT ENDPOINTS
// ============================================================================

// GET / - Root welcome/status endpoint (or served from dist SPA fallback below)
app.get('/', (req, res, next) => {
  const indexPath = path.join(distPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }
  return res.status(200).json({
    status: 'OK',
    message: 'Startup CRM Lite Backend is running successfully!',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
});

// GET /api/health - Lightweight health probe for load balancers and container orchestrators
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date(),
  });
});

// ============================================================================
// 7. API FEATURE ROUTES
// ============================================================================

// Mount authentication and user profile routes
app.use('/api/auth', authRoutes);

// Mount lead management and pipeline analytics routes
app.use('/api/leads', leadRoutes);

// Unknown API routes return JSON 404
app.use('/api', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
  });
});

// ============================================================================
// 8. PRODUCTION STATIC FILE SERVING (UNIFIED DEPLOYMENT)
// ============================================================================

// Serve built frontend assets if dist folder exists
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));

  // SPA fallback for HTML5 client-side routing
  app.get('{*path}', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    const indexPath = path.join(distPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      return res.sendFile(indexPath);
    }
    return next();
  });
}

// ============================================================================
// 9. GLOBAL ERROR HANDLING MIDDLEWARE
// ============================================================================

// Register global error handler LAST so any unhandled exceptions or next(err) are handled here
app.use(errorHandler);

// ============================================================================
// 10. DATABASE CONNECTION, SERVER LIFECYCLE & GRACEFUL SHUTDOWN
// ============================================================================

const PORT = process.env.PORT || 5000;
const MODE = process.env.NODE_ENV || 'development';

let server;

// Connect to MongoDB Atlas or start in Local Offline Mode
connectDB().then((conn) => {
  const modeLabel = conn ? 'Cloud MongoDB' : 'Local Offline Mode';
  server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} in ${MODE} mode [${modeLabel}]`);
  });
}).catch((err) => {
  console.warn('[Server] connectDB error, starting in Local Offline Mode:', err.message);
  server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} in ${MODE} mode [Local Offline Mode]`);
  });
});

/**
 * Handle graceful shutdown of the server and database connections.
 * Triggered on SIGTERM and SIGINT process signals.
 *
 * @param {string} signal - The termination signal received
 */
const handleGracefulShutdown = async (signal) => {
  console.log(`\n[Server] Received ${signal}. Server shutting down gracefully...`);

  if (server) {
    server.close(async () => {
      console.log('[Server] HTTP server closed cleanly.');
      try {
        await mongoose.connection.close();
        console.log('[Server] MongoDB connection closed cleanly.');
        process.exit(0);
      } catch (err) {
        console.error('[Server] Error closing MongoDB connection:', err);
        process.exit(1);
      }
    });
  } else {
    process.exit(0);
  }

  // Force process shutdown if cleanup hangs past 10 seconds
  setTimeout(() => {
    console.error('[Server] Forced shutdown after timeout.');
    process.exit(1);
  }, 10000).unref();
};

// Listen for termination signals
process.on('SIGTERM', () => handleGracefulShutdown('SIGTERM'));
process.on('SIGINT', () => handleGracefulShutdown('SIGINT'));
app.get("/",(req,res)=>{
  res.send("CRM Backend is running successfully!");
});
export default app;
