import type { Request, Response } from "express";
import {
    createHoliday,
    getHolidays,
    getActiveHolidays,
    updateHoliday,
    deactivateHoliday,
    activateHoliday,
} from "../services/holiday.service.js";


// ─────────────────────────────────────────────
// Create Holiday
// ─────────────────────────────────────────────

export const createHolidayController = async (
    req: Request,
    res: Response
) => {
    try {
        const { name, date } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Holiday name is required",
            });
        }

        if (!date) {
            return res.status(400).json({
                success: false,
                message: "Holiday date is required",
            });
        }

        const companyId = req.user?.companyId;

        if (!companyId) {
            return res.status(400).json({
                success: false,
                message: "Company not found",
            });
        }

        const holiday = await createHoliday(
            companyId,
            {
                name,
                date,
            }
        );

        return res.status(201).json({
            success: true,
            message: "Holiday created successfully",
            data: holiday,
        });

    } catch (error: any) {
        console.error("Create Holiday Error:", error);

        return res.status(400).json({
            success: false,
            message: error.message || "Failed to create holiday",
        });
    }
};


// ─────────────────────────────────────────────
// Get Holidays
// ─────────────────────────────────────────────

export const getHolidaysController = async (
    req: Request,
    res: Response
) => {
    try {
        const companyId = req.user?.companyId ?? null;

        const holidays = await getHolidays(companyId);

        return res.status(200).json({
            success: true,
            message: "Holidays fetched successfully",
            data: holidays,
        });

    } catch (error: any) {
        console.error("Get Holidays Error:", error);

        return res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch holidays",
        });
    }
};


// ─────────────────────────────────────────────
// Get Active Holidays
// ─────────────────────────────────────────────

export const getActiveHolidaysController = async (
    req: Request,
    res: Response
) => {
    try {
        const companyId = req.user?.companyId;

        if (!companyId) {
            return res.status(400).json({
                success: false,
                message: "Company not found",
            });
        }

        const holidays = await getActiveHolidays(companyId);

        return res.status(200).json({
            success: true,
            message: "Active holidays fetched successfully",
            data: holidays,
        });

    } catch (error: any) {
        console.error("Get Active Holidays Error:", error);

        return res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch holidays",
        });
    }
};


// ─────────────────────────────────────────────
// Update Holiday
// ─────────────────────────────────────────────

// Update Holiday
export const updateHolidayController = async (
    req: Request,
    res: Response
) => {
    try {
        const { id } = req.params;
        const { name, date } = req.body;

        if (typeof id !== "string") {
            return res.status(400).json({
                success: false,
                message: "Invalid holiday ID",
            });
        }

        if (
            name !== undefined &&
            (!name || !name.trim())
        ) {
            return res.status(400).json({
                success: false,
                message: "Holiday name cannot be empty",
            });
        }

        const holiday = await updateHoliday(id, {
            name,
            date,
        });

        return res.status(200).json({
            success: true,
            message: "Holiday updated successfully",
            data: holiday,
        });

    } catch (error: any) {
        console.error("Update Holiday Error:", error);

        return res.status(400).json({
            success: false,
            message: error.message || "Failed to update holiday",
        });
    }
};


// Deactivate Holiday
export const deactivateHolidayController = async (
    req: Request,
    res: Response
) => {
    try {
        const { id } = req.params;

        if (typeof id !== "string") {
            return res.status(400).json({
                success: false,
                message: "Invalid holiday ID",
            });
        }

        const result = await deactivateHoliday(id);

        return res.status(200).json({
            success: true,
            message: result.message,
        });

    } catch (error: any) {
        console.error("Deactivate Holiday Error:", error);

        return res.status(400).json({
            success: false,
            message: error.message || "Failed to deactivate holiday",
        });
    }
};


// Activate Holiday
export const activateHolidayController = async (
    req: Request,
    res: Response
) => {
    try {
        const { id } = req.params;

        if (typeof id !== "string") {
            return res.status(400).json({
                success: false,
                message: "Invalid holiday ID",
            });
        }

        const result = await activateHoliday(id);

        return res.status(200).json({
            success: true,
            message: result.message,
        });

    } catch (error: any) {
        console.error("Activate Holiday Error:", error);

        return res.status(400).json({
            success: false,
            message: error.message || "Failed to activate holiday",
        });
    }
};
