/*
  Warnings:

  - A unique constraint covering the columns `[name,category]` on the table `Permission` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Permission" ADD COLUMN     "category" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Permission_name_category_key" ON "Permission"("name", "category");
