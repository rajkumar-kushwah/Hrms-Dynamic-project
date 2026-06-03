import express from "express";
import { createRole, deleteRole, getRole, updateRole } from "../controllers/Role.controller.ts";
import { protect } from "../middleware/auth.middleware.ts";
import { checkPermissions } from "../middleware/role.middleware.ts";

// role.routes.ts
const router = express.Router();
router.post('/', protect, checkPermissions("ROLE.CREATE"), createRole);

router.get('/', protect, checkPermissions("ROLE.VIEW"), getRole);

router.put('/:id', protect, checkPermissions("ROLE.UPDATE"), updateRole);

router.delete('/:id', protect, checkPermissions("ROLE.DELETE"), deleteRole);

export default router;