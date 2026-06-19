import { Router } from "express";
import {
    createEmployee,
    getEmployees,
    getEmployeeById,
    updateEmployee,
    deleteEmployee,
} from "../controllers/Employee.controller.ts";
import { protect } from "../middleware/auth.middleware.ts";
import { authorize } from "../middleware/role.middleware.ts";

const router = Router();

router.get("/", protect, authorize("employee", "canView"), getEmployees);
router.get("/:id", protect, authorize("employee", "canView"), getEmployeeById);
router.post("/", protect, authorize("employee", "canCreate"), createEmployee);
router.put("/:id", protect, authorize("employee", "canEdit"), updateEmployee);
router.delete("/:id", protect, authorize("employee", "canDelete"), deleteEmployee);

export default router;