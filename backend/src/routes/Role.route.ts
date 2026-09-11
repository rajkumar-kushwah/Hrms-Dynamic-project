import express from "express";

import { Router } from "express";
import {
    createRole,
    getCompanyRoles,
    getRolePermissions,
    updateRolePermissions,
    deleteRole,
    getModules
} from "../controllers/Role.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";
import { validate } from "../middleware/validation.middleware.js";
import { createRoleSchema, updateRoleSchema } from "../validations/role.validation.js";

const router = Router();

router.get("/modules", protect, getModules);

router.get("/", protect, authorize("roles", "canView"), getCompanyRoles);

router.post("/", protect, authorize("roles", "canCreate"), validate(createRoleSchema), createRole);

router.get("/:id/permissions", protect, authorize("roles", "canView"), getRolePermissions);

router.put("/:id", protect, authorize("roles", "canEdit"), validate(updateRoleSchema), updateRolePermissions);

router.delete("/:id", protect, authorize("roles", "canDelete"), deleteRole);


export default router;