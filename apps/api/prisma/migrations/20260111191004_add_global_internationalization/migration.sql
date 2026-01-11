-- CreateEnum
CREATE TYPE "ReportTarget" AS ENUM ('BUSINESS', 'REVIEW', 'USER', 'MESSAGE');

-- CreateEnum
CREATE TYPE "ReportReason" AS ENUM ('SPAM', 'INAPPROPRIATE', 'FAKE', 'HARASSMENT', 'MISLEADING', 'COPYRIGHT', 'SCAM', 'OTHER');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('PENDING', 'UNDER_REVIEW', 'RESOLVED', 'DISMISSED');

-- CreateEnum
CREATE TYPE "ReportPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'PASSWORD_CHANGE', 'VERIFICATION', 'SUSPENSION', 'REPORT', 'REVIEW');

-- AlterTable
ALTER TABLE "businesses" ADD COLUMN     "defaultLanguage" TEXT DEFAULT 'en',
ADD COLUMN     "regionId" TEXT;

-- AlterTable
ALTER TABLE "services" ADD COLUMN     "currencyCode" TEXT DEFAULT 'USD';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "detectedRegionId" TEXT,
ADD COLUMN     "preferredLanguage" TEXT DEFAULT 'en',
ADD COLUMN     "preferredRegionId" TEXT;

-- CreateTable
CREATE TABLE "regions" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nativeName" TEXT,
    "defaultLanguage" TEXT NOT NULL DEFAULT 'en',
    "supportedLangs" TEXT[] DEFAULT ARRAY['en']::TEXT[],
    "currencyId" TEXT NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "isRTL" BOOLEAN NOT NULL DEFAULT false,
    "flagEmoji" TEXT,
    "phoneCode" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "regions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "currencies" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "symbolPosition" TEXT NOT NULL DEFAULT 'before',
    "decimalPlaces" INTEGER NOT NULL DEFAULT 2,
    "thousandSeparator" TEXT NOT NULL DEFAULT ',',
    "decimalSeparator" TEXT NOT NULL DEFAULT '.',
    "exchangeRateToUSD" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "lastRateUpdate" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "currencies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "translation_cache" (
    "id" TEXT NOT NULL,
    "sourceHash" TEXT NOT NULL,
    "sourceText" TEXT NOT NULL,
    "sourceLang" TEXT NOT NULL DEFAULT 'en',
    "targetLang" TEXT NOT NULL,
    "translatedText" TEXT NOT NULL,
    "entityType" TEXT,
    "entityId" TEXT,
    "quality" DOUBLE PRECISION,
    "hitCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "translation_cache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reports" (
    "id" TEXT NOT NULL,
    "reporterId" TEXT NOT NULL,
    "reporterIp" TEXT,
    "targetType" "ReportTarget" NOT NULL,
    "targetId" TEXT NOT NULL,
    "reason" "ReportReason" NOT NULL,
    "description" TEXT,
    "status" "ReportStatus" NOT NULL DEFAULT 'PENDING',
    "priority" "ReportPriority" NOT NULL DEFAULT 'NORMAL',
    "reviewedById" TEXT,
    "reviewNotes" TEXT,
    "resolution" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" "AuditAction" NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "oldValue" JSONB,
    "newValue" JSONB,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "spam_scores" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "flags" TEXT[],
    "actionCount" INTEGER NOT NULL DEFAULT 0,
    "lastActionAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "blockedUntil" TIMESTAMP(3),
    "permanentBan" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "spam_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "two_factor_auth" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "secret" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "backupCodes" TEXT[],
    "lastUsedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "two_factor_auth_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recently_viewed" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recently_viewed_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saved_searches" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "query" TEXT,
    "category" TEXT,
    "location" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "radius" DOUBLE PRECISION,
    "filters" JSONB,
    "notifyNew" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "saved_searches_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "regions_code_key" ON "regions"("code");

-- CreateIndex
CREATE INDEX "regions_code_idx" ON "regions"("code");

-- CreateIndex
CREATE INDEX "regions_active_idx" ON "regions"("active");

-- CreateIndex
CREATE INDEX "regions_order_idx" ON "regions"("order");

-- CreateIndex
CREATE UNIQUE INDEX "currencies_code_key" ON "currencies"("code");

-- CreateIndex
CREATE INDEX "currencies_code_idx" ON "currencies"("code");

-- CreateIndex
CREATE INDEX "currencies_active_idx" ON "currencies"("active");

-- CreateIndex
CREATE INDEX "translation_cache_sourceHash_idx" ON "translation_cache"("sourceHash");

-- CreateIndex
CREATE INDEX "translation_cache_sourceLang_targetLang_idx" ON "translation_cache"("sourceLang", "targetLang");

-- CreateIndex
CREATE INDEX "translation_cache_entityType_entityId_idx" ON "translation_cache"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "translation_cache_hitCount_idx" ON "translation_cache"("hitCount");

-- CreateIndex
CREATE UNIQUE INDEX "translation_cache_sourceHash_targetLang_key" ON "translation_cache"("sourceHash", "targetLang");

-- CreateIndex
CREATE INDEX "reports_reporterId_idx" ON "reports"("reporterId");

-- CreateIndex
CREATE INDEX "reports_targetType_targetId_idx" ON "reports"("targetType", "targetId");

-- CreateIndex
CREATE INDEX "reports_status_idx" ON "reports"("status");

-- CreateIndex
CREATE INDEX "reports_priority_idx" ON "reports"("priority");

-- CreateIndex
CREATE INDEX "reports_createdAt_idx" ON "reports"("createdAt");

-- CreateIndex
CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("userId");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- CreateIndex
CREATE INDEX "audit_logs_entityType_entityId_idx" ON "audit_logs"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- CreateIndex
CREATE INDEX "spam_scores_score_idx" ON "spam_scores"("score");

-- CreateIndex
CREATE INDEX "spam_scores_blockedUntil_idx" ON "spam_scores"("blockedUntil");

-- CreateIndex
CREATE INDEX "spam_scores_permanentBan_idx" ON "spam_scores"("permanentBan");

-- CreateIndex
CREATE UNIQUE INDEX "spam_scores_entityType_entityId_key" ON "spam_scores"("entityType", "entityId");

-- CreateIndex
CREATE UNIQUE INDEX "two_factor_auth_userId_key" ON "two_factor_auth"("userId");

-- CreateIndex
CREATE INDEX "two_factor_auth_userId_idx" ON "two_factor_auth"("userId");

-- CreateIndex
CREATE INDEX "recently_viewed_userId_idx" ON "recently_viewed"("userId");

-- CreateIndex
CREATE INDEX "recently_viewed_viewedAt_idx" ON "recently_viewed"("viewedAt");

-- CreateIndex
CREATE UNIQUE INDEX "recently_viewed_userId_businessId_key" ON "recently_viewed"("userId", "businessId");

-- CreateIndex
CREATE INDEX "saved_searches_userId_idx" ON "saved_searches"("userId");

-- CreateIndex
CREATE INDEX "saved_searches_createdAt_idx" ON "saved_searches"("createdAt");

-- CreateIndex
CREATE INDEX "businesses_regionId_idx" ON "businesses"("regionId");

-- CreateIndex
CREATE INDEX "businesses_regionId_active_idx" ON "businesses"("regionId", "active");

-- CreateIndex
CREATE INDEX "users_preferredRegionId_idx" ON "users"("preferredRegionId");

-- AddForeignKey
ALTER TABLE "regions" ADD CONSTRAINT "regions_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES "currencies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_preferredRegionId_fkey" FOREIGN KEY ("preferredRegionId") REFERENCES "regions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "businesses" ADD CONSTRAINT "businesses_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "regions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
