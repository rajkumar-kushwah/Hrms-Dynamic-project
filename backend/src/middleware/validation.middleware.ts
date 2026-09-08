import type { Request, Response, NextFunction } from "express";
import type { ZodSchema } from "zod";

export const validate = (schema: ZodSchema, target: "body" | "params" = "body") => {
    return (req: Request, res: Response, next: NextFunction) => {
        const data = target === "params" ? req.params : req.body;
        const result = schema.safeParse(data);

        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: result.error.issues,
            });
        }
        if (target === "body") {
            req.body = result.data;
        }

        next();
    };
};