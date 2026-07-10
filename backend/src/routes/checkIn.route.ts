import { protect } from "../middleware/auth.middleware.js";
// import { checkPermissions } from "../middleware/role.middleware.js";
import { checkIn, checkOut, getAttendance, filterAttendance, deleteAttendance } from "../controllers/checkIn.controller.js";
import express from "express";

const router = express.Router();
router.use(protect);

router.post('/', protect,  checkIn);

router.post('/checkout', protect,  checkOut);

router.get('/', protect, getAttendance);

router.get('/filter', protect,  filterAttendance);

router.delete('/bulk-delete', protect, deleteAttendance);

export default router