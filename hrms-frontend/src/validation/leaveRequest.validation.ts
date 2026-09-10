import { z } from "zod";

export const createLeaveRequestSchema = z
  .object({
    startDate: z.coerce.date({
      message: "Start date is required",
    }),

    endDate: z.coerce.date({
      message: "End date is required",
    }),

    leaveTypeId: z
      .string()
      .min(1, "Leave type is required"),

    reason: z
      .string()
      .max(500, "Reason cannot exceed 500 characters")
      .optional(),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: "End date cannot be before start date",
    path: ["endDate"],
  });

export type CreateLeaveRequestData = z.infer<
  typeof createLeaveRequestSchema
>;