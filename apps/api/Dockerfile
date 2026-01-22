FROM node:20-alpine AS base

RUN apk add --no-cache openssl

WORKDIR /app

COPY apps/api/package.json ./
COPY apps/api/prisma ./prisma

RUN npm install

COPY apps/api/src ./src
COPY apps/api/tsconfig.json ./
COPY apps/api/nest-cli.json ./

RUN npx prisma generate
RUN npm run build

FROM node:20-alpine AS production

RUN apk add --no-cache openssl

WORKDIR /app

COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/dist ./dist
COPY --from=base /app/prisma ./prisma
COPY --from=base /app/package.json ./

EXPOSE 3001

# Start the app
CMD node dist/main.js
