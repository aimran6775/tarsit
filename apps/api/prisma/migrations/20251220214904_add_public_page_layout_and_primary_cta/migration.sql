-- AlterTable
ALTER TABLE "businesses" ADD COLUMN     "publicPagePrimaryCta" TEXT NOT NULL DEFAULT 'book',
ADD COLUMN     "publicPageSectionOrder" TEXT[] DEFAULT ARRAY[]::TEXT[];
