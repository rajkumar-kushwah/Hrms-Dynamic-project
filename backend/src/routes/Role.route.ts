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

const router = Router();

router.get("/modules", protect, getModules);

router.get("/", protect, authorize("roles", "canView"), getCompanyRoles);

router.post("/", protect, authorize("roles", "canCreate"), createRole);

router.get("/:id/permissions", protect, authorize("roles", "canView"), getRolePermissions);

router.put("/:id", protect, authorize("roles", "canEdit"), updateRolePermissions);

router.delete("/:id", protect, authorize("roles", "canDelete"), deleteRole);


export default router;