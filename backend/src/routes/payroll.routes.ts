import { Router } from "express";
import {
    getPayrollSummary,
    getEmployeePayrollDetail,
    updateEmployeeSalary,
} from "../controllers/payroll.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";
import { validate } from "../middleware/validation.middleware.js";

import { updateEmployeeSalarySchema } from "../validations/payroll.validation.js";

const router = Router();

router.get("/summary", protect, authorize("payroll", "canView"), getPayrollSummary);
router.get("/employee/:userId", protect, authorize("payroll", "canView"), getEmployeePayrollDetail);
router.patch("/employee/:userId/salary", protect, authorize("employee", "canEdit"), validate(updateEmployeeSalarySchema), updateEmployeeSalary);

export default router;