import { Router } from "express";
import {
    createCategory,
    getCategories,
    getCategoryById,
    updateCategory,
    deleteCategory,
    permanentDeleteCategory,
} from "../controllers/category.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { authorize, checkSuperAdmin } from "../middleware/role.middleware.js";

const router = Router();

router.get("/", protect, authorize("category", "canView"), getCategories);
router.get("/:id", protect, authorize("category", "canView"), getCategoryById);
router.post("/", protect, authorize("category", "canCreate"), createCategory);
router.put("/:id", protect, authorize("category", "canEdit"), updateCategory);
router.delete("/:id", protect, authorize("category", "canDelete"), deleteCategory);

router.delete("/:id/permanent", protect,checkSuperAdmin, permanentDeleteCategory );

export default router;