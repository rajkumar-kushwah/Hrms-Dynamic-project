/*
  Warnings:

  - The `totalHours` column on the `Attendance` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `overtime` column on the `Attendance` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Attendance" DROP COLUMN "totalHours",
ADD COLUMN     "totalHours" INTEGER,
DROP COLUMN "overtime",
ADD COLUMN     "overtime" INTEGER;
