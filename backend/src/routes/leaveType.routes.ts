// leaveType.routes.ts
import { Router } from "express";
import { createLeaveType, getLeaveTypes, updateLeaveType, deleteLeaveType } from "../controllers/leaveType.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

const router = Router();
router.get("/", protect, authorize("leave_policy", "canView"), getLeaveTypes);
router.post("/", protect, authorize("leave_policy", "canCreate"), createLeaveType);
router.put("/:id", protect, authorize("leave_policy", "canEdit"), updateLeaveType);
router.delete("/:id", protect, authorize("leave_policy", "canDelete"), deleteLeaveType);

export default router;