import { z } from "zod";
import { isValidPhoneNumber } from "react-phone-number-input";

export const companySchema = z.object({
    name: z
        .string()
        .trim()
        .min(3, "Name must be at least 3 characters")
        .max(64, "Name must not exceed 64 characters")
        .regex(/^[A-Za-z]+(?: [A-Za-z]+)*$/, {
            message: "Name can contain only letters and spaces",
        }),

    email: z
        .string()
        .trim()
        .email("Invalid email address")
        .max(64, "Email must not exceed 64 characters"),

    phone: z
        .string()
        .refine(
            (value) => isValidPhoneNumber(value),
            "Invalid phone number"
        ),

    website: z
        .string()
        .trim()
        .url("Invalid website URL"),

    address: z
        .string()
        .trim()
        .min(3, "Address must be at least 3 characters")
        .max(255, "Address must not exceed 255 characters"),

    gstNumber: z
        .string()
        .trim()
        .regex(
            /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
            "Invalid GST Number format"
        ),
})

export const assignAdminSchema = z.object({
    name: z
        .string()
        .trim()
        .min(3, "Name must be at least 3 characters")
        .max(64, "Name must not exceed 64 characters")
        .regex(/^[A-Za-z]+(?: [A-Za-z]+)*$/, {
            message: "Name can contain only letters and spaces",
        }),

    email: z
        .string()
        .trim()
        .email("Invalid email address")
        .max(64, "Email must not exceed 64 characters"),

    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .max(64, "Password must not exceed 64 characters"),
});