// payroll.service.ts
import { api } from "../api/axios";

export const getPayrollSummary = (month: number, year: number) =>
    api.get("/payroll/summary", { params: { month, year } });

export const getEmployeePayrollDetail = (userId: string, month: number, year: number) =>
    api.get(`/payroll/employee/${userId}`, { params: { month, year } });

export const updateEmployeeSalary = (userId: string, grossSalary: number) =>
    api.patch(`/payroll/employee/${userId}/salary`, { grossSalary });



export const downloadBulkSalarySlips = (userIds: string[], month: number, year: number) => api.post(`/payroll/salary-slips/bulk`, { userIds, month, year }, { responseType: "blob", });
export const confirmPayroll = (
    userIds: string[],
    month: number,
    year: number
) => api.post("/payroll/confirm", { userIds, month, year });

export const markPayrollAsPaid = (
    userIds: string[],
    month: number,
    year: number,
    paymentRef?: string
) => api.post("/payroll/mark-paid", { userIds, month, year, paymentRef });

export const revertPayrollToDraft = (
    userId: string,
    month: number,
    year: number
) => api.post(`/payroll/employee/${userId}/revert-to-draft`, { month, year });

export const downloadSalarySlip = (userId: string, month: number, year: number) =>
    api.get(`/payroll/employee/${userId}/salary-slip`, {   
        params: { month, year },
        responseType: "blob",
    });