import { z } from "zod";
import { isValidPhoneNumber } from "react-phone-number-input";

export const branchSchema = z.object({
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
    address: z
        .string()
        .trim()
        .min(3, "Address must be at least 3 characters")
        .max(255, "Address must not exceed 255 characters"),
    managerName: z
        .string()
        .trim()
        .min(3, "Manager name must be at least 3 characters")
        .max(64, "Manager name must not exceed 64 characters")
        .regex(/^[A-Za-z]+(?: [A-Za-z]+)*$/, {
            message: "Manager name can contain only letters and spaces",
        }),

    latitude: z
        .number()
        .min(-90, "Latitude must be between -90 and 90")
        .max(90, "Latitude must be between -90 and 90"),

    longitude: z
        .number()
        .min(-180, "Longitude must be between -180 and 180")
        .max(180, "Longitude must be between -180 and 180"),
})