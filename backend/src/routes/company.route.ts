import express from "express";
import {
    createCompany,
    getCompanies,
    getCompanyById,
    updateCompany,
    deleteCompany,
} from "../controllers/company.controller.ts";
import { protect } from "../middleware/auth.middleware.ts";

const router = express.Router();

router.post("/", protect, createCompany);
router.get("/", protect, getCompanies);
router.get("/:id", protect, getCompanyById);
router.put("/:id", protect, updateCompany);
router.delete("/:id", protect, deleteCompany);

export default router;