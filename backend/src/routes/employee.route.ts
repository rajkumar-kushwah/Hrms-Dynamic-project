import { Router } from "express";
import {
    createEmployee,
    getEmployees,
    getEmployeeById,
    updateEmployee,
    deleteEmployee,
    resetEmployeePassword,
} from "../controllers/Employee.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

const router = Router();

router.get("/", protect, authorize("employee", "canView"), getEmployees);
router.get("/:id", protect, authorize("employee", "canView"), getEmployeeById);
router.post("/", protect, authorize("employee", "canCreate"), createEmployee);
router.put("/:id", protect, authorize("employee", "canEdit"), updateEmployee);
router.delete("/:id", protect, authorize("employee", "canDelete"), deleteEmployee);
router.patch("/:id/reset-password", protect, authorize("employee", "canEdit"), resetEmployeePassword);

export default router;