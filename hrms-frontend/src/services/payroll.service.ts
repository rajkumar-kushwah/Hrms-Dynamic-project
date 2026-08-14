import { api } from "../api/axios";

export const getPayrollSummary = (month: number, year: number) =>
    api.get("/payroll/summary", { params: { month, year } });

export const getSalaryStructure = (userId: string) =>
    api.get(`/payroll/salary-structure/${userId}`);

export const saveSalaryStructure = (userId: string, data: any) =>
    api.post(`/payroll/salary-structure/${userId}`, data);