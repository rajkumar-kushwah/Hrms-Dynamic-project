import express from "express";
import {
    getUsers,
    toggleUserStatus,
    resetUserPassword,
} from "../controllers/companyUser.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

const router = express.Router();

router.get("/", protect, authorize("company-users", "canView"), getUsers);

router.patch("/:id/toggle-status", protect, authorize("company-users", "canEdit"), toggleUserStatus);

router.patch("/:id/reset-password", protect, authorize("company-users", "canEdit"), resetUserPassword);

export default router;