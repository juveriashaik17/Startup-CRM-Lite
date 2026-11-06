# Startup CRM Lite 🚀

A modern, fast, full-stack CRM built for early-stage startups and sales teams. Features pipeline management, lead conversion tracking, responsive analytics charts, authentication, and MongoDB persistence.

---

## Tech Stack

- **Frontend**: React 19, Vite 8, Tailwind CSS v4, Lucide Icons, Recharts, React Router v7, React Hot Toast
- **Backend**: Node.js, Express 5, MongoDB / Mongoose 9, JWT, Helmet, Morgan, Express Validator, Express Rate Limit
- **Tooling**: Oxlint, Docker, Vercel ready

---

## Project Structure

```
startup-crm-lite/
├── backend/                   # Express REST API backend
│   ├── config/database.js     # MongoDB connection & lifecycle
│   ├── controllers/           # Auth and Lead route controllers
│   ├── middleware/            # JWT auth, validation, error handler
│   ├── models/                # User & Lead Mongoose schemas
│   ├── routes/                # Express API routes
│   ├── utils/                 # Standardized API response formatters
│   ├── .env.example           # Example backend configuration
│   ├── seed.js                # Database seed script
│   ├── server.js              # Main Express server entrypoint
│   └── test-api.js            # 82-point comprehensive API test suite
├── src/                       # React Frontend SPA
│   ├── components/            # Analytics, Dashboard, Layout, Leads
│   ├── context/               # AuthContext, LeadContext, ThemeContext
│   ├── data/                  # Offline fallback sample data
│   ├── hooks/                 # useAnalytics, useLocalStorage
│   ├── pages/                 # Dashboard, Leads, Analytics, Login, Register
│   ├── routes/                # Client-side router & ProtectedRoute
│   ├── services/              # Axios API client & services
│   └── App.jsx / main.jsx     # Root application shell & providers
├── public/                    # Static assets
├── dist/                      # Production client build
├── Dockerfile                 # Multi-stage container deployment
├── Procfile                   # Process file for Render / Railway / Heroku
├── vercel.json                # SPA rewrite configuration for Vercel
├── .env.example               # Example frontend environment variables
└── package.json               # Monorepo/unified scripts
```

---

## Getting Started

### 1. Environment Setup

Copy example environment files:

```bash
# Frontend environment
cp .env.example .env

# Backend environment
cp backend/.env.example backend/.env
```

Edit `backend/.env` with your MongoDB connection string and a secret key:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/crm?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
```

In `.env` at root:
```env
VITE_API_URL=http://localhost:5000
```

### 2. Install Dependencies

```bash
# Root & frontend dependencies
npm install

# Backend dependencies
cd backend && npm install && cd ..
```

### 3. Seed Database (Optional)

Populate demo data (including user `demo@startupcrm.com` / `Password123!`):

```bash
npm run seed
```

### 4. Run Development Servers

In terminal 1 (Backend):
```bash
npm run server
# or with auto-reload:
npm run server:dev
```

In terminal 2 (Frontend):
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser. Vite proxies `/api` calls directly to `http://localhost:5000`.

---

## Verification & Testing

Run the automated backend test suite (verifies 82 tests covering authentication, route guards, validation, pagination, and aggregation metrics):

```bash
npm run test:backend
```

Run frontend linter and build:

```bash
npm run lint
npm run build
```

---

## Deployment Options

### Option A: Unified Deployment (Render / Railway / Heroku / DigitalOcean)

The backend Express server is pre-configured to automatically serve the frontend build from `dist/` when present.

1. Build command:
   ```bash
   npm run build && cd backend && npm install --omit=dev
   ```
2. Start command:
   ```bash
   npm start
   ```
3. Set environment variables on your host:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `NODE_ENV=production`

### Option B: Docker Container

A multi-stage `Dockerfile` is provided:

```bash
docker build -t startup-crm-lite .
docker run -p 5000:5000 -e MONGODB_URI="..." -e JWT_SECRET="..." startup-crm-lite
```

### Option C: Decoupled (Vercel Frontend + Render/Railway Backend)

1. **Frontend (Vercel)**:
   - Framework preset: `Vite`
   - Build command: `npm run build`
   - Output directory: `dist`
   - Environment variable: `VITE_API_URL=https://your-backend.onrender.com`
   - Uses included `vercel.json` for client-side routing.

2. **Backend (Render / Railway)**:
   - Root directory: `backend`
   - Build command: `npm install --omit=dev`
   - Start command: `node server.js`
   - Environment variables:
     - `FRONTEND_URL=https://your-frontend.vercel.app`
     - `MONGODB_URI=...`
     - `JWT_SECRET=...`
     - `NODE_ENV=production`
