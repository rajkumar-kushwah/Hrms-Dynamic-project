/*
  Warnings:

  - You are about to drop the `_CompanyToOnboardingChecklistItem` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_CompanyToOnboardingChecklistItem" DROP CONSTRAINT "_CompanyToOnboardingChecklistItem_A_fkey";

-- DropForeignKey
ALTER TABLE "_CompanyToOnboardingChecklistItem" DROP CONSTRAINT "_CompanyToOnboardingChecklistItem_B_fkey";

-- DropTable
DROP TABLE "_CompanyToOnboardingChecklistItem";
