import { Router } from "express";
import { getSettings, updateSettings } from "../controllers/settings.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";
import { validate } from "../middleware/validation.middleware.js";
import { updateSettingsSchema } from "../validations/settings.validation.js";

const router = Router();

router.get("/", protect, authorize("settings", "canView"), getSettings);
router.put("/", protect, authorize("settings", "canEdit"), validate(updateSettingsSchema), updateSettings);

export default router;