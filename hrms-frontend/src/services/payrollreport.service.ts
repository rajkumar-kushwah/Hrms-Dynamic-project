import { api } from "@/api/axios";




// payrollreport.service.ts
export const getMonthlyPayrollReport = (month: number, year: number) =>
    api.get("/payroll-report", { params: { month, year } });

// Add these to your existing payrollreport.service.ts
