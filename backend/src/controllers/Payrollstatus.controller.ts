import type { Request, Response } from "express";
import * as PayrollStatusService from "../services/Payrollstatus.service.js"; // adjust path to match your project

// ─────────────────────────────────────────────────────────────
// Helper: same pattern as your existing payroll.controller.ts
// ─────────────────────────────────────────────────────────────

const isAdminUser = (req: Request) => {
    const roleName = req.user?.role?.name
        ?.trim()
        .toLowerCase()
        .replace(/\s+/g, "_");

    return roleName === "super_admin" || roleName === "company_admin";
};

// ─────────────────────────────────────────────────────────────
// POST /api/payroll/confirm
// Body: { userIds: string[], month: number, year: number }
// Admin/Company Admin only — an employee should never confirm
// their own payroll.
// ─────────────────────────────────────────────────────────────

export const confirmPayrollHandler = async (req: Request, res: Response) => {
    try {
        if (!isAdminUser(req)) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to confirm payroll",
            });
        }

        const userIds = req.body?.userIds;
        const month = Number(req.body?.month) || new Date().getMonth() + 1;
        const year = Number(req.body?.year) || new Date().getFullYear();

        if (!Array.isArray(userIds) || userIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: "userIds is required",
            });
        }

        const data = await PayrollStatusService.confirmPayroll(
            userIds as string[],
            month,
            year
        );

        return res.status(200).json({ success: true, data });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ─────────────────────────────────────────────────────────────
// POST /api/payroll/mark-paid
// Body: { userIds: string[], month: number, year: number, paymentRef?: string }
// Admin/Company Admin only.
// ─────────────────────────────────────────────────────────────

export const markPaidHandler = async (req: Request, res: Response) => {
    try {
        if (!isAdminUser(req)) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to mark payroll as paid",
            });
        }

        const userIds = req.body?.userIds;
        const month = Number(req.body?.month) || new Date().getMonth() + 1;
        const year = Number(req.body?.year) || new Date().getFullYear();
        const paymentRef: string | undefined = req.body?.paymentRef;

        if (!Array.isArray(userIds) || userIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: "userIds is required",
            });
        }

        const data = await PayrollStatusService.markPayrollAsPaid(
            userIds as string[],
            month,
            year,
            paymentRef
        );

        return res.status(200).json({ success: true, data });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ─────────────────────────────────────────────────────────────
// POST /api/payroll/employee/:userId/revert-to-draft
// Body: { month: number, year: number }
// Admin/Company Admin only.
// ─────────────────────────────────────────────────────────────

export const revertToDraftHandler = async (req: Request, res: Response) => {
    try {
        if (!isAdminUser(req)) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to revert payroll",
            });
        }

        const userId = req.params.userId as string;
        const month = Number(req.body?.month) || new Date().getMonth() + 1;
        const year = Number(req.body?.year) || new Date().getFullYear();

        const data = await PayrollStatusService.revertPayrollToDraft(
            userId,
            month,
            year
        );

        return res.status(200).json({ success: true, data });
    } catch (error: any) {
        return res.status(400).json({ success: false, message: error.message });
    }
};