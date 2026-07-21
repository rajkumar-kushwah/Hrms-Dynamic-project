import { Router } from "express";
import {
    createBranch,
    getBranches,
    getBranchById,
    updateBranch,
    deleteBranch,
    permanentDeleteBranch,
    getGeoFencingOverview,
} from "../controllers/branch.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { authorize, checkSuperAdmin } from "../middleware/role.middleware.js";

const router = Router();

router.get("/", protect, authorize("branch", "canView"), getBranches);
router.get("/:id", protect, authorize("branch", "canView"), getBranchById);
router.post("/", protect, authorize("branch", "canCreate"), createBranch);
router.put("/:id", protect, authorize("branch", "canEdit"), updateBranch);
router.delete("/:id", protect, authorize("branch", "canDelete"), deleteBranch);

router.delete("/:id/permanent", protect,checkSuperAdmin, permanentDeleteBranch );
router.get("/geo-fencing/overview", protect, authorize("geo_fencing", "canView"), getGeoFencingOverview);

export default router;