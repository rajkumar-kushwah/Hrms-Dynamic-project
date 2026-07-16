import { Router } from "express";
import { getSettings, updateSettings } from "../controllers/settings.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

const router = Router();

router.get("/", protect, authorize("settings", "canView"), getSettings);
router.put("/", protect, authorize("settings", "canEdit"), updateSettings);

export default router;