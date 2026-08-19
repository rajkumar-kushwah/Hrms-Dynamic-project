import express from "express";

import {
    createHolidayController,
    getHolidaysController,
    getActiveHolidaysController,
    updateHolidayController,
    deactivateHolidayController,
    activateHolidayController,
} from "../controllers/holiday.controller.js";

import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

const router = express.Router();


// Get all holidays
router.get(
    "/",
    protect,
    authorize("holiday", "canView"),
    getHolidaysController
);


// Get active holidays
router.get(
    "/active",
    protect,
    authorize("holiday", "canView"),
    getActiveHolidaysController
);


// Create holiday
router.post(
    "/",
    protect,
    authorize("holiday", "canCreate"),
    createHolidayController
);


// Update holiday
router.put(
    "/:id",
    protect,
    authorize("holiday", "canEdit"),
    updateHolidayController
);


// Deactivate holiday
router.delete(
    "/:id",
    protect,
    authorize("holiday", "canDelete"),
    deactivateHolidayController
);


// Activate holiday
router.patch(
    "/:id/activate",
    protect,
    authorize("holiday", "canEdit"),
    activateHolidayController
);


export default router;