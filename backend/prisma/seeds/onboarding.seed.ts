import { prisma } from "../../src/config/db.ts";

export const seedOnboardingTemplates = async () => {
  const companies = await prisma.company.findMany({
    select: {
      id: true,
    },
  });

  if (companies.length === 0) {
    console.log("No companies found. Skipping onboarding templates.");
    return;
  }

  const templates = [
    // OFFER
    {
      stage: "OFFER" as const,
      title: "Offer Letter Signed",
      description: "Employee has signed and accepted the offer letter.",
      isRequired: true,
      requiresDocument: true,
      order: 1,
    },

    // JOINING
    {
      stage: "JOINING" as const,
      title: "Joining Form Completed",
      description: "Employee joining formalities are completed.",
      isRequired: true,
      requiresDocument: false,
      order: 1,
    },

    // DOCUMENTS
    {
      stage: "DOCUMENTS" as const,
      title: "Identity Documents Submitted",
      description: "Employee has submitted required identity documents.",
      isRequired: true,
      requiresDocument: true,
      order: 1,
    },
    {
      stage: "DOCUMENTS" as const,
      title: "Bank Details Submitted",
      description: "Employee has submitted bank account details.",
      isRequired: true,
      requiresDocument: true,
      order: 2,
    },

    // TRAINING
    {
      stage: "TRAINING" as const,
      title: "Company Orientation Completed",
      description: "Employee has completed company orientation.",
      isRequired: true,
      requiresDocument: false,
      order: 1,
    },
    {
      stage: "TRAINING" as const,
      title: "Department Training Completed",
      description: "Employee has completed department-specific training.",
      isRequired: true,
      requiresDocument: false,
      order: 2,
    },

    // ACTIVE
    {
      stage: "ACTIVE" as const,
      title: "Employee Activation",
      description: "Employee is ready to become an active employee.",
      isRequired: true,
      requiresDocument: false,
      order: 1,
    },
  ];

  for (const company of companies) {
    for (const template of templates) {
      const existing = await prisma.onboardingChecklistTemplate.findFirst({
        where: {
          companyId: company.id,
          stage: template.stage,
          title: template.title,
        },
      });

      if (existing) {
        await prisma.onboardingChecklistTemplate.update({
          where: {
            id: existing.id,
          },
          data: {
            description: template.description,
            isRequired: template.isRequired,
            requiresDocument: template.requiresDocument,
            order: template.order,
            isActive: true,
          },
        });
      } else {
        await prisma.onboardingChecklistTemplate.create({
          data: {
            companyId: company.id,
            stage: template.stage,
            title: template.title,
            description: template.description,
            isRequired: template.isRequired,
            requiresDocument: template.requiresDocument,
            order: template.order,
          },
        });
      }
    }
  }

  console.log("Onboarding checklist templates seeded!");
};