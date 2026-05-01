# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package.json ./
RUN npm install -g pnpm && pnpm install

# Copy source code
COPY . .

# Build application
RUN pnpm build

# Production stage
FROM node:22-alpine

WORKDIR /app

# Install production dependencies only
COPY package.json ./
RUN npm install -g pnpm && pnpm install --prod

# Copy built application from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/dist/public ./client/dist

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start application
CMD ["node", "dist/index.js"]