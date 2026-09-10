import { z } from "zod";

export const createHolidaySchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, "Holiday name is required")
        .max(100, "Holiday name cannot exceed 100 characters"),

    date: z
        .string()
        .min(1, "Holiday date is required")
        .refine(
            (value) => !isNaN(new Date(value).getTime()),
            "Invalid holiday date"
        ),
});

export type CreateHolidayData = z.infer<
    typeof createHolidaySchema
>;

export const updateHolidaySchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, "Holiday name cannot be empty")
        .max(100, "Holiday name cannot exceed 100 characters")
        .optional(),

    date: z
        .string()
        .min(1, "Holiday date cannot be empty")
        .refine(
            (value) => !isNaN(new Date(value).getTime()),
            "Invalid holiday date"
        )
        .optional(),
});

export type UpdateHolidayData = z.infer<
    typeof updateHolidaySchema
>;