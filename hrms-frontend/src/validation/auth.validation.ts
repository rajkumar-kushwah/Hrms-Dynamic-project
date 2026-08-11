import { z } from "zod";

export const signinSchema = z.object({
    email: z
        .string()
        .min(3, {
            message: "Email must be at least 3 characters",
        })
        .max(64, {
            message: "Email must be at most 64 characters",
        })
        .regex(
            /^[A-Za-z0-9!#$%&'*+/=?^_`{|}~.-]+@[A-Za-z0-9.-]+$/,
            {
                message: "Invalid email address",
            }
        ),

    password: z
        .string()
        .min(8, {
            message: "Password must be at least 8 characters",
        })
        .max(30, {
            message: "Password must not exceed 30 characters",
        })
        .regex(/[A-Z]/, {
            message: "Password must contain at least 1 uppercase letter",
        })
        .regex(/[a-z]/, {
            message: "Password must contain at least 1 lowercase letter",
        })
        .regex(/[0-9]/, {
            message: "Password must contain at least 1 numeric character",
        })
        .regex(/[^A-Za-z0-9]/, {
            message: "Password must contain at least 1 special character",
        }),
});