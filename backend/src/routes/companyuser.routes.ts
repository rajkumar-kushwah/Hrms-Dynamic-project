import express from "express";
import {
    getUsers,
    toggleUserStatus,
    resetUserPassword,
} from "../controllers/companyUser.controller.ts";
import { protect } from "../middleware/auth.middleware.ts";
import { authorize } from "../middleware/role.middleware.ts";

const router = express.Router();

router.get("/", protect,authorize("users", "canView"), getUsers );

router.patch("/:id/toggle-status", protect, authorize("users", "canEdit"), toggleUserStatus );

router.patch("/:id/reset-password", protect, authorize("users", "canEdit"), resetUserPassword );

export default router;