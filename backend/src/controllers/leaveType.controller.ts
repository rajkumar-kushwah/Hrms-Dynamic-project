// leaveType.controller.ts
import type { Request, Response } from "express";
import * as LeaveTypeService from "../services/leaveType.service.js";

export const createLeaveType = async (req: Request, res: Response) => {
    try {
        const companyId = req.user?.companyId!;
        const leaveType = await LeaveTypeService.createLeaveType(companyId, req.body);
        return res.status(201).json({ success: true, message: "Leave type created successfully", data: leaveType });
    } catch (error: any) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

export const getLeaveTypes = async (req: Request, res: Response) => {
    try {
        const companyId = req.user?.role?.name === "super_admin" ? null : req.user?.companyId!;
        const leaveTypes = await LeaveTypeService.getLeaveTypes(companyId);
        return res.status(200).json({ success: true, data: leaveTypes });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const updateLeaveType = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const leaveType = await LeaveTypeService.updateLeaveType(id, req.body);
        return res.status(200).json({ success: true, message: "Leave type updated successfully", data: leaveType });
    } catch (error: any) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

export const deleteLeaveType = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const result = await LeaveTypeService.deleteLeaveType(id);
        return res.status(200).json({ success: true, message: result.message });
    } catch (error: any) {
        return res.status(400).json({ success: false, message: error.message });
    }
};