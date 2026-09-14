import { z } from "zod";

export const updateSettingsSchema = z.object({
    lateMarkHour: z
        .number()
        .int()
        .min(0, "Late mark hour cannot be negative")
        .max(23, "Late mark hour must be between 0 and 23")
        .optional(),

    lateMarkMinute: z
        .number()
        .int()
        .min(0, "Late mark minute cannot be negative")
        .max(59, "Late mark minute must be between 0 and 59")
        .optional(),

    halfDayHours: z
        .number()
        .positive("Half day hours must be greater than 0")
        .optional(),

    defaultGeoRadius: z
        .number()
        .positive("Geo radius must be greater than 0")
        .optional(),

    weekOffDays: z
        .array(
            z
                .number()
                .int()
                .min(0, "Invalid week off day")
                .max(6, "Invalid week off day")
        )
        .optional(),
});