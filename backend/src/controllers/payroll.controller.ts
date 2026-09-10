import type { Request, Response } from "express";
import * as PayrollService from "../services/payroll.service.js";


export const getPayrollSummary = async (req: Request, res: Response) => {
    try {

        const roleName = req.user?.role?.name
            ?.trim()
            .toLowerCase()
            .replace(/\s+/g, "_");

        const isAdmin =
            roleName === "super_admin" ||
            roleName === "company_admin";

        const companyId = req.user?.companyId ?? null;

        const month = Number(req.query.month) || new Date().getMonth() + 1;
        const year = Number(req.query.year) || new Date().getFullYear();

        if (!companyId && isAdmin) {
            return res.status(400).json({
                success: false,
                message: "Super Admin cannot view payroll — please select a company context"
            });
        }

        const data = await PayrollService.getPayrollSummary(companyId, month, year, isAdmin ? undefined : req.user!.id);

        return res.status(200).json({ success: true, data });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const getEmployeePayrollDetail = async (req: Request, res: Response) => {
    try {

        const roleName = req.user?.role?.name
            ?.trim()
            .toLowerCase()
            .replace(/\s+/g, "_");

        const isAdmin =
            roleName === "super_admin" ||
            roleName === "company_admin";

        const userId = isAdmin
            ? (req.params.userId as string)
            : req.user!.id;

        const companyId = req.user?.companyId;

        if (!companyId && isAdmin) {
            return res.status(400).json({
                success: false,
                message: "Super Admin cannot view payroll — please select a company context",
            });
        }
        const month = Number(req.query.month) || new Date().getMonth() + 1;
        const year = Number(req.query.year) || new Date().getFullYear();

        const data = await PayrollService.getEmployeePayrollDetail(userId, companyId, month, year);

        return res.status(200).json({ success: true, data });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const updateEmployeeSalary = async (req: Request, res: Response) => {
    try {
        const userId = req.params.userId as string;
        const { grossSalary } = req.body;
        const companyId = req.user?.companyId;

        if (grossSalary === undefined || grossSalary < 0) {
            return res.status(400).json({
                success: false,
                message: "Valid grossSalary is required"
            });
        }

        const result = await PayrollService.updateEmployeeSalary(userId, companyId, grossSalary);

        return res.status(200).json({
            success: true,
            message: "Salary updated successfully",
            data: result
        });
    } catch (error: any) {
        return res.status(400).json({ success: false, message: error.message });
    }
};