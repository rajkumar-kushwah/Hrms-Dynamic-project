-- CreateTable
CREATE TABLE "OnboardingChecklistTemplate" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "stage" "OnboardingStage" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "requiresDocument" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OnboardingChecklistTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OnboardingChecklistTemplate_companyId_stage_idx" ON "OnboardingChecklistTemplate"("companyId", "stage");

-- AddForeignKey
ALTER TABLE "OnboardingChecklistTemplate" ADD CONSTRAINT "OnboardingChecklistTemplate_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
