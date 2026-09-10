import { z } from "zod";

export const payrollPeriodSchema = z.object({
    month: z.coerce
        .number()
        .int("Month must be a whole number")
        .min(1, "Month must be between 1 and 12")
        .max(12, "Month must be between 1 and 12"),

    year: z.coerce
        .number()
        .int("Year must be a whole number")
        .min(2000, "Invalid year")
        .max(2100, "Invalid year"),
});

export type PayrollPeriodData = z.infer<
    typeof payrollPeriodSchema
>;


export const payrollUserParamsSchema = z.object({
    userId: z
        .string()
        .min(1, "Employee ID is required"),
});

export type PayrollUserParamsData = z.infer<
    typeof payrollUserParamsSchema
>;


export const updateEmployeeSalarySchema = z.object({
    grossSalary: z.coerce
        .number()
        .finite("Gross salary must be a valid number")
        .min(0, "Gross salary cannot be negative"),
});

export type UpdateEmployeeSalaryData = z.infer<
    typeof updateEmployeeSalarySchema
>;