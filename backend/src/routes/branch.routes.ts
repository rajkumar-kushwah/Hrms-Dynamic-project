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
import { validate } from "../middleware/validation.middleware.js";
import { createBranchSchema,updateBranchSchema, branchIdSchema } from "../validations/branch.validator.js";

const router = Router();

router.get("/", protect, authorize("branch", "canView"), getBranches);
router.get("/geo-fencing/overview", protect, authorize("geo_fencing", "canView"),getGeoFencingOverview);
router.get("/:id", protect, authorize("branch", "canView"), validate(branchIdSchema, "params"), getBranchById);
router.post("/", protect, authorize("branch", "canCreate"), validate(createBranchSchema), createBranch);
router.put("/:id", protect, authorize("branch", "canEdit"), validate(branchIdSchema, "params"), validate(updateBranchSchema), updateBranch);
router.delete("/:id", protect, authorize("branch", "canDelete"), validate(branchIdSchema, "params"), deleteBranch);

router.delete("/:id/permanent", protect,checkSuperAdmin, validate(branchIdSchema, "params"), permanentDeleteBranch );

export default router;