import express from "express";
import {
    createCompany,
    getAllCompanies,
    getCompanyById,
    updateCompany,
    deleteCompany,
    assignCompanyAdmin,
    getMyCompany,
} from "../controllers/company.controller.ts";
import { protect } from "../middleware/auth.middleware.ts";
import { authorize } from "../middleware/role.middleware.ts";

const router = express.Router();

router.get("/me", protect, getMyCompany );
router.post("/", protect, authorize("company", "canCreate"), createCompany);
router.get("/", protect, authorize("company", "canView"), getAllCompanies);
router.get("/:id", protect, authorize("company", "canView"), getCompanyById);
router.put("/:id", protect, authorize("company", "canEdit"), updateCompany);
router.delete("/:id", protect, authorize("company", "canDelete"), deleteCompany);

// assign company admin 
router.post("/:id/assign-admin", protect, authorize("company", "canCreate"), assignCompanyAdmin);
// get my company

export default router;