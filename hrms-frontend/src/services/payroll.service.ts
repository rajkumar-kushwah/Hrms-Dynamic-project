// payroll.service.ts
import { api } from "../api/axios";

export const getPayrollSummary = (month: number, year: number) =>
    api.get("/payroll/summary", { params: { month, year } });

export const getEmployeePayrollDetail = (userId: string, month: number, year: number) =>
    api.get(`/payroll/employee/${userId}`, { params: { month, year } });

export const updateEmployeeSalary = (userId: string, grossSalary: number) =>
    api.patch(`/payroll/employee/${userId}/salary`, { grossSalary });