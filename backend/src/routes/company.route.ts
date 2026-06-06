import express from "express";
import {
    createCompany,
    getCompanies,
    getCompanyById,
    updateCompany,
    deleteCompany,
} from "../controllers/company.controller.ts";
import { protect } from "../middleware/auth.middleware.ts";
import { authorize } from "../middleware/role.middleware.ts";

const router = express.Router();

router.post("/", protect, authorize("company", "canCreate"), createCompany);
router.get("/", protect, authorize("company", "canView"), getCompanies);
router.get("/:id", protect, authorize("company", "canView"), getCompanyById);
router.put("/:id", protect, authorize("company", "canEdit"), updateCompany);
router.delete("/:id", protect, authorize("company", "canDelete"), deleteCompany);

export default router;