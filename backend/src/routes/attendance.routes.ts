import { Router } from "express";
import {
    punchIn,
    punchOut,
    getTodayAttendance,
    getMyAttendance,
    getAllAttendance,
    getLiveAttendance
} from "../controllers/attendance.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

const router = Router();

router.post("/punch-in", protect, authorize("attendance", "canCreate"), punchIn);
router.post("/punch-out", protect, authorize("attendance", "canCreate"), punchOut);
router.get("/today", protect, authorize("attendance", "canView"), getTodayAttendance);
router.get("/my-history", protect, authorize("attendance", "canView"), getMyAttendance);
router.get("/all", protect, authorize("attendance", "canView"), getAllAttendance);
router.get("/live", protect, authorize("attendance_live", "canView"), getLiveAttendance);

export default router;

