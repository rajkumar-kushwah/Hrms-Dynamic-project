import { Router } from "express";
import {
    createBranch,
    getBranches,
    getBranchById,
    updateBranch,
    deleteBranch,
} from "../controllers/branch.controller.ts";
import { protect } from "../middleware/auth.middleware.ts";
import { authorize } from "../middleware/role.middleware.ts";

const router = Router();

router.get("/", protect, authorize("branch", "canView"), getBranches);
router.get("/:id", protect, authorize("branch", "canView"), getBranchById);
router.post("/", protect, authorize("branch", "canCreate"), createBranch);
router.put("/:id", protect, authorize("branch", "canEdit"), updateBranch);
router.delete("/:id", protect, authorize("branch", "canDelete"), deleteBranch);

export default router;