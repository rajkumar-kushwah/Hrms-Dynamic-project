import { protect } from "../middleware/auth.middleware.ts";
import { getMonthlyAttendance, FilteredMonthlyAttendance } from "../controllers/MonthlyAttendance.controller.ts";
// import { checkPermissions } from "../middleware/role.middleware.ts";
import express from "express";

const router = express.Router();
router.use(protect);

router.get('/monthly', protect,   getMonthlyAttendance);

router.get('/filter', protect,  FilteredMonthlyAttendance);

export default router
