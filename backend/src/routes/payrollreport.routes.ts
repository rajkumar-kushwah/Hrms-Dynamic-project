import { Router } from "express";
import { monthlyPayrollReport } from "../controllers/payrollReport.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

const router = Router();

// report route
router.get("/", protect, authorize("payroll", "canView"), monthlyPayrollReport);

export default router;