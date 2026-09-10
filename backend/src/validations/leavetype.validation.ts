import { z } from "zod";

export const createLeaveTypeSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, "Leave type name is required")
        .max(100, "Leave type name cannot exceed 100 characters"),

    description: z
        .string()
        .trim()
        .max(500, "Description cannot exceed 500 characters")
        .optional(),

    daysPerYear: z
        .number()
        .min(0, "Days per year cannot be negative")
        .optional(),

    isPaid: z
        .boolean()
        .optional(),
});

export type CreateLeaveTypeData = z.infer<typeof createLeaveTypeSchema>;

export const updateLeaveTypeSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, "Leave type name is required")
        .max(100, "Leave type name cannot exceed 100 characters")
        .optional(),

    description: z
        .string()
        .trim()
        .max(500, "Description cannot exceed 500 characters")
        .optional(),

    daysPerYear: z
        .number()
        .min(0, "Days per year cannot be negative")
        .optional(),

    isPaid: z
        .boolean()
        .optional(),

    isActive: z
        .boolean()
        .optional(),
});

export type UpdateLeaveTypeData = z.infer<typeof updateLeaveTypeSchema>;