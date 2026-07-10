import type { Request, Response } from "express";
import * as AttendanceService from "../services/attendance.service.js";

export const punchIn = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id!;
        const companyId = req.user?.companyId!;

        const result = await AttendanceService.punchIn(userId, companyId, req.body);

        return res.status(200).json({
            success: true,
            message: result.message,
            data: result.attendance,
        });
    } catch (error: any) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

export const punchOut = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id!;
        const result = await AttendanceService.punchOut(userId, req.body);

        return res.status(200).json({
            success: true,
            message: result.message,
            data: result.attendance,
        });
    } catch (error: any) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

export const getTodayAttendance = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id!;
        const attendance = await AttendanceService.getTodayAttendance(userId);

        return res.status(200).json({ success: true, data: attendance });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const getMyAttendance = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id!;
        const month = req.query.month ? Number(req.query.month) : undefined;
        const year = req.query.year ? Number(req.query.year) : undefined;

        const attendance = await AttendanceService.getMyAttendance(userId, month, year);

        return res.status(200).json({ success: true, data: attendance });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const getAllAttendance = async (req: Request, res: Response) => {
    try {
        const companyId = req.user?.role?.name === "super_admin"
            ? null
            : req.user?.companyId!;
        const date = req.query.date as string | undefined;

        const attendance = await AttendanceService.getAllAttendance(companyId, date);

        return res.status(200).json({ success: true, data: attendance });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// get live attendance
export const getLiveAttendance = async (req: Request, res: Response) => {
    try {
        const companyId = req.user?.role?.name === "super_admin"
        ? null
        : req.user?.companyId!;

        const attendance = await AttendanceService.getLiveAttendance(companyId);

        return res.status(200).json({ success: true, data: attendance });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
}