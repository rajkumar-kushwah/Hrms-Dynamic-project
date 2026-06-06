import { protect } from "../middleware/auth.middleware.ts";
import express from "express";
import { createEmployee, getEmployees, updateEmployee, deleteEmployee, filterEmployee } from "../controllers/Employee.controller.ts";
import { authorize } from "../middleware/role.middleware.ts";

const router = express.Router();
router.use(protect);

router.post('/', protect, authorize("employee", "canCreate"), createEmployee);

router.get('/', protect, authorize("employee", "canView"), getEmployees);

router.put('/:id', protect, authorize("employee", "canEdit"), updateEmployee);

router.delete('/:id', protect, authorize("employee", "canDelete"), deleteEmployee);


export default router