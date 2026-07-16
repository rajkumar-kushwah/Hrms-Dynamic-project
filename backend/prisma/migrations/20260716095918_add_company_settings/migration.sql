-- CreateTable
CREATE TABLE "CompanySettings" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "lateMarkHour" INTEGER NOT NULL DEFAULT 10,
    "lateMarkMinute" INTEGER NOT NULL DEFAULT 15,
    "halfDayHours" DOUBLE PRECISION NOT NULL DEFAULT 4,
    "defaultGeoRadius" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "weekOffDays" INTEGER[] DEFAULT ARRAY[0]::INTEGER[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanySettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CompanySettings_companyId_key" ON "CompanySettings"("companyId");

-- AddForeignKey
ALTER TABLE "CompanySettings" ADD CONSTRAINT "CompanySettings_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
