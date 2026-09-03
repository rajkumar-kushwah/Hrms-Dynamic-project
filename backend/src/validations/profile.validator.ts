import { z } from "zod";

export const updateProfileSchema = z.object({
    name: z
        .string()
        .min(2, {
            message: "Name must be at least 2 characters",
        })
        .max(50, {
            message: "Name must not exceed 50 characters",
        }),
});

// export const changePasswordSchema = z
//     .object({
//         oldPassword: z
//             .string()
//             .min(1, {
//                 message: "Old password is required",
//             }),

//         newPassword: z
//             .string()
//             .min(8, {
//                 message: "Password must be at least 8 characters",
//             })
//             .max(30, {
//                 message: "Password must not exceed 30 characters",
//             })
//             .regex(/[A-Z]/, {
//                 message: "Password must contain at least 1 uppercase letter",
//             })
//             .regex(/[a-z]/, {
//                 message: "Password must contain at least 1 lowercase letter",
//             })
//             .regex(/[0-9]/, {
//                 message: "Password must contain at least 1 numeric character",
//             })
//             .regex(/[^A-Za-z0-9]/, {
//                 message: "Password must contain at least 1 special character",
//             }),

//         confirmPassword: z
//             .string()
//             .min(1, {
//                 message: "Confirm password is required",
//             }),
//     })
//     .refine((data) => data.newPassword === data.confirmPassword, {
//         message: "Passwords do not match",
//         path: ["confirmPassword"],
//     });

export const changePasswordSchema = z.object({
    oldPassword: z
        .string()
        .min(1, {
            message: "Old password is required",
        }),

    newPassword: z
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