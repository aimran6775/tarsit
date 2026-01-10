FROM node:20-alpine AS base

# Install pnpm and openssl
RUN npm install -g pnpm && apk add --no-cache openssl

WORKDIR /app

# Copy all package files for monorepo
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/

# Copy prisma schema first (needed for postinstall)
COPY apps/api/prisma ./apps/api/prisma

# Install all dependencies
RUN pnpm install --frozen-lockfile

# Copy API source code
COPY apps/api ./apps/api

# Build from root to keep node_modules accessible
RUN cd apps/api && pnpm build

# Production stage
FROM node:20-alpine AS production

RUN npm install -g pnpm && apk add --no-cache openssl

WORKDIR /app

# Copy the entire built structure
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=base /app/apps/api/dist ./apps/api/dist
COPY --from=base /app/apps/api/prisma ./apps/api/prisma
COPY --from=base /app/apps/api/package.json ./apps/api/package.json

WORKDIR /app/apps/api

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD node -e "const http = require('http'); http.get('http://localhost:' + (process.env.PORT || 3001) + '/api/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

# Start the application
CMD ["node", "dist/main.js"]
