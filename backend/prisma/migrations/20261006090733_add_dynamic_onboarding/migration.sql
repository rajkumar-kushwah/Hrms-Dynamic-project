/*
  Warnings:

  - You are about to drop the `OnboardingChecklistTemplate` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "EmploymentStatus" AS ENUM ('ONBOARDING', 'ACTIVE', 'INACTIVE');

-- DropForeignKey
ALTER TABLE "OnboardingChecklistTemplate" DROP CONSTRAINT "OnboardingChecklistTemplate_companyId_fkey";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "employmentStatus" "EmploymentStatus" NOT NULL DEFAULT 'ONBOARDING';

-- DropTable
DROP TABLE "OnboardingChecklistTemplate";

-- CreateTable
CREATE TABLE "Onboarding" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "currentStage" "OnboardingStage" NOT NULL DEFAULT 'OFFER',
    "status" "OnboardingStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "targetDate" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Onboarding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OnboardingChecklistItem" (
    "id" TEXT NOT NULL,
    "onboardingId" TEXT NOT NULL,
    "stage" "OnboardingStage" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "completedBy" TEXT,
    "requiresDocument" BOOLEAN NOT NULL DEFAULT false,
    "documentUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OnboardingChecklistItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CompanyToOnboardingChecklistItem" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CompanyToOnboardingChecklistItem_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Onboarding_userId_key" ON "Onboarding"("userId");

-- CreateIndex
CREATE INDEX "Onboarding_companyId_idx" ON "Onboarding"("companyId");

-- CreateIndex
CREATE INDEX "OnboardingChecklistItem_onboardingId_idx" ON "OnboardingChecklistItem"("onboardingId");

-- CreateIndex
CREATE INDEX "_CompanyToOnboardingChecklistItem_B_index" ON "_CompanyToOnboardingChecklistItem"("B");

-- AddForeignKey
ALTER TABLE "Onboarding" ADD CONSTRAINT "Onboarding_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Onboarding" ADD CONSTRAINT "Onboarding_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OnboardingChecklistItem" ADD CONSTRAINT "OnboardingChecklistItem_onboardingId_fkey" FOREIGN KEY ("onboardingId") REFERENCES "Onboarding"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CompanyToOnboardingChecklistItem" ADD CONSTRAINT "_CompanyToOnboardingChecklistItem_A_fkey" FOREIGN KEY ("A") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CompanyToOnboardingChecklistItem" ADD CONSTRAINT "_CompanyToOnboardingChecklistItem_B_fkey" FOREIGN KEY ("B") REFERENCES "OnboardingChecklistItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
