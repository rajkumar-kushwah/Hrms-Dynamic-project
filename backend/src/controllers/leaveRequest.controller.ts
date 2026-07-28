// leaveRequest.controller.ts
import type { Request, Response } from "express";
import * as LeaveRequestService from "../services/leaveRequest.service.js";

export const createLeaveRequest = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id!;
        const companyId = req.user?.companyId!;
        const leave = await LeaveRequestService.createLeaveRequest(userId, companyId, req.body);
        return res.status(201).json({ success: true, message: "Leave request submitted successfully", data: leave });
    } catch (error: any) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

export const getMyLeaveRequests = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id!;
        const leaves = await LeaveRequestService.getMyLeaveRequests(userId);
        return res.status(200).json({ success: true, data: leaves });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const getAllLeaveRequests = async (req: Request, res: Response) => {
    try {
        const companyId = req.user?.role?.name === "super_admin" ? null : req.user?.companyId!;
        const status = req.query.status as string | undefined;
        const leaves = await LeaveRequestService.getAllLeaveRequests(companyId, status);
        return res.status(200).json({ success: true, data: leaves });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const approveRejectLeave = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const approvedBy = req.user?.id!;
        const { status, rejectReason } = req.body;

        if (!["Approved", "Rejected"].includes(status)) {
            return res.status(400).json({ success: false, message: "Invalid status" });
        }

        const leave = await LeaveRequestService.approvedRejectLeave(id, approvedBy, status, rejectReason);
        return res.status(200).json({ success: true, message: `Leave ${status.toLowerCase()} successfully`, data: leave });
    } catch (error: any) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

export const cancelLeaveRequest = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const userId = req.user?.id!;
        const result = await LeaveRequestService.cancelLeaveRequest(id, userId);
        return res.status(200).json({ success: true, message: result.message });
    } catch (error: any) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

export const revokeLeave = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const revokedBy = req.user?.id!;
        const result = await LeaveRequestService.revokeLeave(id, revokedBy);
        return res.status(200).json({ success: true, message: result.message });
    } catch (error: any) {
        return res.status(400).json({ success: false, message: error.message });
    }
};