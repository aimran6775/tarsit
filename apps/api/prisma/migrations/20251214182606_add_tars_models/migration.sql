/*
  Warnings:

  - You are about to drop the column `reviewedBy` on the `verification_requests` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[username]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[provider,providerId]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `verification_requests` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TeamRole" AS ENUM ('MANAGER', 'STAFF');

-- CreateEnum
CREATE TYPE "EmailStatus" AS ENUM ('PENDING', 'SENT', 'FAILED');

-- CreateEnum
CREATE TYPE "TarsActionStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'EXECUTED', 'FAILED');

-- AlterTable
ALTER TABLE "appointments" ADD COLUMN     "confirmationSent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "customerEmail" TEXT,
ADD COLUMN     "customerName" TEXT,
ADD COLUMN     "customerPhone" TEXT,
ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "reminderSent" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "businesses" ADD COLUMN     "advanceBookingDays" INTEGER NOT NULL DEFAULT 30,
ADD COLUMN     "appointmentBuffer" INTEGER,
ADD COLUMN     "appointmentDuration" INTEGER,
ADD COLUMN     "appointmentsEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "coverImage" TEXT,
ADD COLUMN     "logoImage" TEXT,
ADD COLUMN     "tagline" TEXT,
ADD COLUMN     "themeColor" TEXT DEFAULT '#000000';

-- AlterTable
ALTER TABLE "services" ADD COLUMN     "bookable" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "provider" TEXT,
ADD COLUMN     "providerId" TEXT,
ADD COLUMN     "username" TEXT,
ALTER COLUMN "passwordHash" DROP NOT NULL;

-- AlterTable
ALTER TABLE "verification_requests" DROP COLUMN "reviewedBy",
ADD COLUMN     "adminNotes" TEXT,
ADD COLUMN     "reviewedById" TEXT,
ADD COLUMN     "userId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "team_members" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "TeamRole" NOT NULL DEFAULT 'STAFF',
    "canManageChat" BOOLEAN NOT NULL DEFAULT false,
    "canManageHours" BOOLEAN NOT NULL DEFAULT false,
    "canManageDescription" BOOLEAN NOT NULL DEFAULT false,
    "canManagePhotos" BOOLEAN NOT NULL DEFAULT false,
    "canManageServices" BOOLEAN NOT NULL DEFAULT false,
    "canManageAppointments" BOOLEAN NOT NULL DEFAULT false,
    "canViewAnalytics" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "invitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acceptedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "team_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "business_hours" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "openTime" TEXT NOT NULL,
    "closeTime" TEXT NOT NULL,
    "isClosed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "business_hours_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_audit_logs" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "details" JSONB,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_logs" (
    "id" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "template" TEXT NOT NULL,
    "status" "EmailStatus" NOT NULL DEFAULT 'PENDING',
    "error" TEXT,
    "sentAt" TIMESTAMP(3),
    "appointmentId" TEXT,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tars_conversations" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "businessId" TEXT,
    "sessionId" TEXT NOT NULL,
    "context" TEXT NOT NULL DEFAULT 'general',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tars_conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tars_messages" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tars_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tars_memory" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "businessId" TEXT,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'general',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tars_memory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tars_action_queue" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "businessId" TEXT,
    "actionType" TEXT NOT NULL,
    "actionData" JSONB NOT NULL,
    "description" TEXT NOT NULL,
    "status" "TarsActionStatus" NOT NULL DEFAULT 'PENDING',
    "priority" INTEGER NOT NULL DEFAULT 0,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tars_action_queue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tars_settings" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "allowMemory" BOOLEAN NOT NULL DEFAULT true,
    "personality" TEXT NOT NULL DEFAULT 'friendly',
    "customPrompt" TEXT,
    "autoRespond" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tars_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "team_members_businessId_idx" ON "team_members"("businessId");

-- CreateIndex
CREATE INDEX "team_members_userId_idx" ON "team_members"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "team_members_businessId_userId_key" ON "team_members"("businessId", "userId");

-- CreateIndex
CREATE INDEX "business_hours_businessId_idx" ON "business_hours"("businessId");

-- CreateIndex
CREATE UNIQUE INDEX "business_hours_businessId_dayOfWeek_key" ON "business_hours"("businessId", "dayOfWeek");

-- CreateIndex
CREATE INDEX "admin_audit_logs_adminId_idx" ON "admin_audit_logs"("adminId");

-- CreateIndex
CREATE INDEX "admin_audit_logs_entityType_entityId_idx" ON "admin_audit_logs"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "admin_audit_logs_createdAt_idx" ON "admin_audit_logs"("createdAt");

-- CreateIndex
CREATE INDEX "email_logs_to_idx" ON "email_logs"("to");

-- CreateIndex
CREATE INDEX "email_logs_status_idx" ON "email_logs"("status");

-- CreateIndex
CREATE INDEX "email_logs_template_idx" ON "email_logs"("template");

-- CreateIndex
CREATE INDEX "email_logs_createdAt_idx" ON "email_logs"("createdAt");

-- CreateIndex
CREATE INDEX "tars_conversations_userId_idx" ON "tars_conversations"("userId");

-- CreateIndex
CREATE INDEX "tars_conversations_businessId_idx" ON "tars_conversations"("businessId");

-- CreateIndex
CREATE INDEX "tars_conversations_sessionId_idx" ON "tars_conversations"("sessionId");

-- CreateIndex
CREATE INDEX "tars_messages_conversationId_idx" ON "tars_messages"("conversationId");

-- CreateIndex
CREATE INDEX "tars_memory_userId_idx" ON "tars_memory"("userId");

-- CreateIndex
CREATE INDEX "tars_memory_businessId_idx" ON "tars_memory"("businessId");

-- CreateIndex
CREATE UNIQUE INDEX "tars_memory_userId_businessId_key_key" ON "tars_memory"("userId", "businessId", "key");

-- CreateIndex
CREATE INDEX "tars_action_queue_status_idx" ON "tars_action_queue"("status");

-- CreateIndex
CREATE INDEX "tars_action_queue_businessId_idx" ON "tars_action_queue"("businessId");

-- CreateIndex
CREATE INDEX "tars_action_queue_userId_idx" ON "tars_action_queue"("userId");

-- CreateIndex
CREATE INDEX "tars_action_queue_createdAt_idx" ON "tars_action_queue"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "tars_settings_businessId_key" ON "tars_settings"("businessId");

-- CreateIndex
CREATE INDEX "appointments_businessId_date_idx" ON "appointments"("businessId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE INDEX "users_provider_providerId_idx" ON "users"("provider", "providerId");

-- CreateIndex
CREATE UNIQUE INDEX "users_provider_providerId_key" ON "users"("provider", "providerId");

-- CreateIndex
CREATE INDEX "verification_requests_userId_idx" ON "verification_requests"("userId");

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verification_requests" ADD CONSTRAINT "verification_requests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verification_requests" ADD CONSTRAINT "verification_requests_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_hours" ADD CONSTRAINT "business_hours_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_audit_logs" ADD CONSTRAINT "admin_audit_logs_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tars_messages" ADD CONSTRAINT "tars_messages_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "tars_conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
