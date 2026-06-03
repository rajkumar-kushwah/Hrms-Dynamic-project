/*
  Warnings:

  - You are about to drop the column `overtime` on the `Attendance` table. All the data in the column will be lost.
  - You are about to drop the column `totalHours` on the `Attendance` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Attendance" DROP COLUMN "overtime",
DROP COLUMN "totalHours",
ADD COLUMN     "overtimeMinutes" INTEGER,
ADD COLUMN     "totalMinutes" INTEGER;
