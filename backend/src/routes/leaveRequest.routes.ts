// leaveRequest.routes.ts
import { Router } from "express";
import {
    createLeaveRequest, getMyLeaveRequests, getAllLeaveRequests,
    approveRejectLeave, cancelLeaveRequest,
    revokeLeave,
} from "../controllers/leaveRequest.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

const router = Router();
router.post("/", protect, createLeaveRequest);
router.get("/my", protect, getMyLeaveRequests);
router.get("/all", protect, authorize("leave_approval", "canView"), getAllLeaveRequests);
router.patch("/:id/status", protect, authorize("leave_approval", "canEdit"), approveRejectLeave);
router.delete("/:id", protect, cancelLeaveRequest);
router.delete("/:id/revoke", protect, authorize("leave_approval", "canEdit"), revokeLeave);

export default router;