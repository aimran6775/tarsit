-- AlterTable
ALTER TABLE "businesses" ADD COLUMN     "messagingEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "showHours" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "showPhone" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "showReviews" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "showServices" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "showWebsite" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "tars_usage" (
    "id" TEXT NOT NULL,
    "monthKey" TEXT NOT NULL,
    "inputTokens" INTEGER NOT NULL DEFAULT 0,
    "outputTokens" INTEGER NOT NULL DEFAULT 0,
    "totalCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "requestCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tars_usage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tars_usage_monthKey_key" ON "tars_usage"("monthKey");
