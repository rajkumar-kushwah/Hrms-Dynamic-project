import { protect } from "../middleware/auth.middleware.ts";
import { getMonthlyAttendance, FilteredMonthlyAttendance } from "../controllers/MonthlyAttendance.controller.ts";
import { checkPermissions } from "../middleware/role.middleware.ts";
import express from "express";

const router = express.Router();
router.use(protect);

router.get('/monthly', protect, checkPermissions("MONTHLY_ATTENDANCE.VIEW"),  getMonthlyAttendance);

router.get('/filter', protect, checkPermissions("MONTHLY_ATTENDANCE.FILTER"), FilteredMonthlyAttendance);

export default router
