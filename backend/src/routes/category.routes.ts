import { Router } from "express";
import {
    createCategory,
    getCategories,
    getCategoryById,
    updateCategory,
    deleteCategory,
} from "../controllers/category.controller.ts";
import { protect } from "../middleware/auth.middleware.ts";
import { authorize } from "../middleware/role.middleware.ts";

const router = Router();

router.get("/", protect, authorize("category", "canView"), getCategories);
router.get("/:id", protect, authorize("category", "canView"), getCategoryById);
router.post("/", protect, authorize("category", "canCreate"), createCategory);
router.put("/:id", protect, authorize("category", "canEdit"), updateCategory);
router.delete("/:id", protect, authorize("category", "canDelete"), deleteCategory);

export default router;