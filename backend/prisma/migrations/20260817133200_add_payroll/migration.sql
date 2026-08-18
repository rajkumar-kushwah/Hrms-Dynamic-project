-- AlterTable
ALTER TABLE "LeaveType" ADD COLUMN "isPaid" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "User" ADD COLUMN "grossSalary" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "Payroll" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "grossSalary" DOUBLE PRECISION NOT NULL,
    "workingDays" INTEGER NOT NULL,
    "presentDays" INTEGER NOT NULL,
    "paidLeaveDays" INTEGER NOT NULL,
    "unpaidLeaveDays" INTEGER NOT NULL,
    "absentDays" INTEGER NOT NULL,
    "unpaidDeduction" DOUBLE PRECISION NOT NULL,
    "netSalary" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payroll_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Payroll_userId_month_year_key"
ON "Payroll"("userId", "month", "year");

-- AddForeignKey
ALTER TABLE "Payroll"
ADD CONSTRAINT "Payroll_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;