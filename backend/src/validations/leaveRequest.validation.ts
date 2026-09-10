import { z } from "zod";

export const createLeaveRequestSchema = z.object({
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
}).refine(
    (data) => data.endDate >= data.startDate,
    {
        message: "End date cannot be before start date",
        path: ["endDate"],
    }
);

export const approveRejectLeaveSchema = z
    .object({
        status: z.enum(["Approved", "Rejected"], {
            message: "Status must be Approved or Rejected",
        }),

        rejectReason: z
            .string()
            .max(500, "Reject reason cannot exceed 500 characters")
            .optional(),
    })
    .refine(
        (data) =>
            data.status !== "Rejected" ||
            Boolean(data.rejectReason?.trim()),
        {
            message: "Reject reason is required when rejecting leave",
            path: ["rejectReason"],
        }
    );