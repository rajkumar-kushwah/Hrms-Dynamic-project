import { Router } from "express";
import {
    punchIn,
    punchOut,
    getTodayAttendance,
    getMyAttendance,
    getAllAttendance,
} from "../controllers/attendance.controller.ts";
import { protect } from "../middleware/auth.middleware.ts";
import { authorize } from "../middleware/role.middleware.ts";

const router = Router();

router.post("/punch-in", protect, authorize("attendance", "canCreate"), punchIn);
router.post("/punch-out", protect, authorize("attendance", "canCreate"), punchOut);
router.get("/today", protect, authorize("attendance", "canView"), getTodayAttendance);
router.get("/my-history", protect, authorize("attendance", "canView"), getMyAttendance);
router.get("/all", protect, authorize("attendance", "canView"), getAllAttendance);

export default router;

