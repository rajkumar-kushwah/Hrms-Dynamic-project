import { z } from "zod";

export const createRoleSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, "Role name is required")
        .max(50, "Role name cannot exceed 50 characters"),

    description: z
        .string()
        .trim()
        .max(200, "Description cannot exceed 200 characters")
        .optional(),
});

export const updateRoleSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, "Role name is required")
        .max(50, "Role name cannot exceed 50 characters"),

    description: z
        .string()
        .trim()
        .min(1, "Description is required")
        .max(200, "Description cannot exceed 200 characters")
        .optional(),

    permissions: z
        .array(
            z.object({
                moduleId: z.number().int().positive("Invalid module ID"),
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