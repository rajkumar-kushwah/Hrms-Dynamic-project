import { createDepartment, getDepartments, deleteDepartment, updateDepartment } from "../controllers/Department.controller.ts";
import { protect  } from "../middleware/auth.middleware.ts";
import express from "express";

const router = express.Router();
router.use(protect);



router.post('/', createDepartment)       
router.get('/', getDepartments)   
router.delete('/:id', deleteDepartment)
router.put('/:id', updateDepartment) 

export default router
