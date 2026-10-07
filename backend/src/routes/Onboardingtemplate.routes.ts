import { Router } from "express";
import { protect } from "../middleware/auth.middleware.js";
import {
    getTemplates,
    createTemplateItem,
    updateTemplateItem,
    deleteTemplateItem,
    reorderTemplateItems,
} from "../controllers/Onboardingtemplate.controller.js";

const router = Router();

router.get("/", protect, getTemplates);
router.post("/", protect, createTemplateItem);
router.post("/reorder", protect, reorderTemplateItems);
router.patch("/:id", protect, updateTemplateItem);
router.delete("/:id", protect, deleteTemplateItem);

export default router;