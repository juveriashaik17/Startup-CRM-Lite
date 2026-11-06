# Stage 1: Build the frontend React application
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Production runtime with backend server
FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production

# Install backend dependencies
COPY backend/package*.json ./backend/
RUN cd backend && npm ci --omit=dev

# Copy backend code
COPY backend ./backend

# Copy compiled frontend from build stage to dist
COPY --from=build /app/dist ./dist

# Expose default port
EXPOSE 5000

# Start unified production server
CMD ["node", "backend/server.js"]
