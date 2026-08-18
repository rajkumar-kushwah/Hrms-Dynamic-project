// payroll.types.ts
export interface PayrollSummary {
  userId: string;
  user: {
    id: string;
    name: string;
    employeeCode?: string;
    designation?: string;
  };
  totalWorkingDays: number;
  presentDays: number;
  halfDays: number;
  paidLeaveDays: number;
  unpaidLeaveDays: number;
  absentDays: number;
  totalUnpaidDays: number;
  grossSalary: number;
  perDaySalary: number;
  deductionAmount: number;
  netSalary: number;
}