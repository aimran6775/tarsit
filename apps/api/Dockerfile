FROM node:20-alpine AS base

# Install pnpm and openssl
RUN npm install -g pnpm && apk add --no-cache openssl

WORKDIR /app

# Copy all package files for monorepo
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/

# Install all dependencies
RUN pnpm install --frozen-lockfile

# Copy API source code
COPY apps/api ./apps/api

# Generate Prisma client and build
WORKDIR /app/apps/api
RUN pnpm prisma generate
RUN pnpm build

# Production stage
FROM node:20-alpine AS production

RUN npm install -g pnpm

WORKDIR /app

# Copy built files and dependencies
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/apps/api/dist ./dist
COPY --from=base /app/apps/api/prisma ./prisma
COPY --from=base /app/apps/api/package.json ./

# Expose port (Koyeb uses PORT env variable, default 8000)
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD node -e "const http = require('http'); http.get('http://localhost:' + (process.env.PORT || 8000) + '/api/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

# Start the application
CMD ["node", "dist/main.js"]
