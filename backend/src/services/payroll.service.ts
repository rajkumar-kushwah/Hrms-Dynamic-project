import { settings } from "node:cluster";
import { prisma } from "../config/db.js";


// Helper — Ek Employee Ki Payroll Calculate Karo

const calculateEmployeePayroll = async (
    userId: string,
    companyId: string,
    month: number,
    year: number
) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            grossSalary: true, name: true, employeeCode: true,
            designation: true, isActive: true

        }

    })
    if (!user) throw new Error("User not found");
    if (!user.grossSalary) throw new Error("Gross salary not found");

    const settings = await prisma.companySettings.findUnique({ where: { companyId } });
    if (!settings) throw new Error("Setting not found");
    const weekOffDays = settings?.weekOffDays ?? [0];

    const startDate = new Date(year, month - 1, 1);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(year, month, 0);
    endDate.setHours(23, 59, 59, 999);

    const totalDaysInMonth = new Date(year, month, 0).getDate();

    let totalWorkingDays = 0;
    for (let d = 1; d <= totalDaysInMonth; d++) {
        const date = new Date(year, month - 1, d);
        if (!weekOffDays.includes(date.getDay())) totalWorkingDays++;
    }

    const attendanceRecords = await prisma.attendance.findMany({
        where: {
            userId,
            date: { gte: startDate, lte: endDate },
            punchInTime: { not: null },
        }
    });

    const presentDays = attendanceRecords.filter(a =>
        a.status === "Present" || a.status === "Late"
    ).length;
    const halfDays = attendanceRecords.filter(a => a.status === "Half-day").length;

    const approvedLeaves = await prisma.leaveRequest.findMany({
        where: {
            userId,
            status: "Approved",
            startDate: { lte: endDate },
            endDate: { gte: startDate },
        },
        include: { leaveType: { select: { isPaid: true, name: true } } }
    });

    let paidLeaveDays = 0;
    let unpaidLeaveDays = 0;

    for (const leave of approvedLeaves) {
        const lStart = new Date(Math.max(leave.startDate.getTime(), startDate.getTime()));
        const lEnd = new Date(Math.min(leave.endDate.getTime(), endDate.getTime()));
        const days = Math.floor((lEnd.getTime() - lStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;

        if (leave.leaveType.isPaid) {
            paidLeaveDays += days;
        } else {
            unpaidLeaveDays += days;
        }
    }
    const accountedDays = presentDays + halfDays + paidLeaveDays + unpaidLeaveDays;
    const absentDays = Math.max(totalWorkingDays - accountedDays, 0);

    const totalUnpaidDays = unpaidLeaveDays + absentDays + (halfDays * 0.5);

    const grossSalary = user.grossSalary ?? 0;
    const perDaySalary = totalWorkingDays > 0 ? grossSalary / totalWorkingDays : 0;
    const deductionAmount = totalUnpaidDays * perDaySalary;
    const netSalary = Math.max(grossSalary - deductionAmount, 0);
    return {
        userId,
        user: {
            id: userId,
            name: user.name,
            employeeCode: user.employeeCode,
            designation: user.designation,
        },
        totalWorkingDays,
        presentDays,
        halfDays,
        paidLeaveDays,
        unpaidLeaveDays,
        absentDays,
        totalUnpaidDays: parseFloat(totalUnpaidDays.toFixed(2)),
        grossSalary,
        perDaySalary: parseFloat(perDaySalary.toFixed(2)),
        deductionAmount: parseFloat(deductionAmount.toFixed(2)),
        netSalary: parseFloat(netSalary.toFixed(2)),
    };
};


// ─── Get Payroll Summary — Saari Employees Ke Liye ──────
export const getPayrollSummary = async (
    companyId: string | null,
    month: number,
    year: number
) => {
    const employees = await prisma.user.findMany({
        where: {
            ...(companyId ? { companyId } : { companyId: { not: null } }),
            isActive: true,
            role: { name: { notIn: ["company_admin", "super_admin"] } },
        },
        select: { id: true }
    });

    const payrollData = await Promise.all(
        employees.map((emp) =>
            calculateEmployeePayroll(emp.id, companyId!, month, year)
        )
    );

    return payrollData;
};

// ─── Get Single Employee Payroll Detail ─────────────────
export const getEmployeePayrollDetail = async (
    userId: string,
    companyId: string,
    month: number,
    year: number
) => {
    return await calculateEmployeePayroll(userId, companyId, month, year);
};

// ─── Update Employee Salary ──────────────────────────────
export const updateEmployeeSalary = async (
    userId: string,
    grossSalary: number
) => {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error("Employee not found");

    return await prisma.user.update({
        where: { id: userId },
        data: { grossSalary },
        select: { id: true, name: true, grossSalary: true }
    });
};