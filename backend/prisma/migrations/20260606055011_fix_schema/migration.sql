/*
  Warnings:

  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[roleId,moduleId,companyId]` on the table `Permission` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,companyId]` on the table `Role` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Permission_roleId_moduleId_key";

-- DropIndex
DROP INDEX "Role_name_key";

-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "gstNumber" TEXT,
ADD COLUMN     "maxBranches" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "maxEmployees" INTEGER NOT NULL DEFAULT 10,
ADD COLUMN     "subscriptionEnd" TIMESTAMP(3),
ADD COLUMN     "subscriptionPlan" TEXT NOT NULL DEFAULT 'basic';

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "User_id_seq";

-- CreateIndex
CREATE UNIQUE INDEX "Permission_roleId_moduleId_companyId_key" ON "Permission"("roleId", "moduleId", "companyId");

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_companyId_key" ON "Role"("name", "companyId");
