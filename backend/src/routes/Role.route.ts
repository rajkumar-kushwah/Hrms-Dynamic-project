import express from "express";

import { Router } from "express";
import {
    createRole,
    getAllRoles,
    getRoleById,
    updateRole,
    deleteRole,
} from "../controllers/Role.controller.ts";
import { protect } from "../middleware/auth.middleware.ts";
import { authorize } from "../middleware/role.middleware.ts";

const router = Router();

router.get("/", protect, authorize("roles", "canView"), getAllRoles);

router.get("/:id", protect, authorize("roles", "canView"), getRoleById);

router.post("/", protect, authorize("roles", "canCreate"), createRole);

router.put("/:id", protect, authorize("roles", "canEdit"), updateRole);

router.delete("/:id", protect, authorize("roles", "canDelete"), deleteRole);

export default router;