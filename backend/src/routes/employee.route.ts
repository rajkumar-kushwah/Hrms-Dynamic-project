import { protect } from "../middleware/auth.middleware.ts";
import express from "express";
import { createEmployee, getEmployees, updateEmployee, deleteEmployee, filterEmployee } from "../controllers/Employee.controller.ts";
import { checkPermissions } from "../middleware/role.middleware.ts";

const router = express.Router();
router.use(protect);

router.post('/', protect, checkPermissions("EMPLOYEE.CREATE"), createEmployee);

router.get('/', protect, checkPermissions("EMPLOYEE.VIEW"), getEmployees);

router.put('/:id', protect, checkPermissions("EMPLOYEE.UPDATE"), updateEmployee);

router.delete('/:id', protect, checkPermissions("EMPLOYEE.DELETE"), deleteEmployee);

router.get('/filter', protect, checkPermissions("EMPLOYEE.FILTER"), filterEmployee);

export default router