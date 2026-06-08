import express from "express";

import { Router } from "express";
import {
    createRole,
    getCompanyRoles,
    getRolePermissions,
    updateRolePermissions,
    deleteRole,
} from "../controllers/Role.controller.ts";
import { protect } from "../middleware/auth.middleware.ts";
import { authorize } from "../middleware/role.middleware.ts";

const router = Router();

router.get("/", protect, authorize("roles", "canView"), getCompanyRoles);

router.post("/", protect, authorize("roles", "canCreate"), createRole);

router.get("/:id/permissions", protect, authorize("roles", "canView"), getRolePermissions);

router.put("/:id/permissions", protect, authorize("roles", "canEdit"), updateRolePermissions);

router.delete("/:id", protect, authorize("roles", "canDelete"), deleteRole);

export default router;