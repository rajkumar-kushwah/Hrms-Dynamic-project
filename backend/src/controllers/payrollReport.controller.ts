// payrollReportController.ts
import type { Request, Response } from "express";
import { getMonthlyPayrollReport } from "../services/payrollreport.service.js";

// GET /api/payroll/report?month=9&year=2026
export const monthlyPayrollReport = async (req: Request, res: Response) => {
    try {
        const companyId = req.user?.companyId; // apne auth middleware ke hisaab se adjust karo
        const month = Number(req.query.month);
        const year = Number(req.query.year);

        if (!companyId) {
            return res.status(400).json({ message: "Company ID is required" });
        }

        if (!month || !year || month < 1 || month > 12) {
            return res.status(400).json({ message: "Valid month and year are required" });
        }

        const report = await getMonthlyPayrollReport(companyId, month, year);

        return res.json(report);
    } catch (error: any) {
        console.error("Monthly payroll report failed:", error);
        return res.status(500).json({
            message: error.message || "Failed to generate payroll report",
        });
    }
};