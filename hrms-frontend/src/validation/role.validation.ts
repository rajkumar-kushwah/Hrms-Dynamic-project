import { z } from "zod";

export const roleSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, "Role name is required")
        .max(50, "Role name cannot exceed 50 characters"),

    description: z
        .string()
        .trim()
        .min(1,"Description is required")
        .max(200, "Description cannot exceed 200 characters"),

    permissions: z
    .array(
        z.object({
            moduleId: z.number().int().positive(),
            canView: z.boolean(),
            canCreate: z.boolean(),
            canEdit: z.boolean(),
            canDelete: z.boolean(),
        })
    )
    .refine(
        (permissions) =>
            permissions.some(
                (permission) =>
                    permission.canView ||
                    permission.canCreate ||
                    permission.canEdit ||
                    permission.canDelete
            ),
        {
            message: "At least one permission must be selected",
        }
    ),
});