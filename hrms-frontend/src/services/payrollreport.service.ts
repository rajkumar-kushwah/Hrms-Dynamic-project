import { api } from "@/api/axios";




// payroll.service.ts
export const getMonthlyPayrollReport = (month: number, year: number) =>
    api.get("/payroll-report", { params: { month, year } });