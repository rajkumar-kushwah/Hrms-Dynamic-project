import type { Request, Response } from "express";
import * as SettingsService from "../services/settings.service.js";

export const getSettings = async (req: Request, res: Response) => {
    try {
        const companyId = req.user?.companyId!;

        if (!companyId) {
            return res.status(400).json({
                success: false,
                message: "No company assigned"
            });
        }

        const settings = await SettingsService.getSettings(companyId);

        return res.status(200).json({ success: true, data: settings });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const updateSettings = async (req: Request, res: Response) => {
    try {
        const companyId = req.user?.companyId!;

        if (!companyId) {
            return res.status(400).json({
                success: false,
                message: "No company assigned"
            });
        }

        const settings = await SettingsService.updateSettings(companyId, req.body);

        return res.status(200).json({
            success: true,
            message: "Settings updated successfully",
            data: settings,
        });
    } catch (error: any) {
        return res.status(400).json({ success: false, message: error.message });
    }
};
