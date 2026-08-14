export interface SalaryStructure {
  id: string;
  userId: string;
  basicSalary: number;
  hra: number;
  da?: number;
  conveyanceAllowance?: number;
  medicalAllowance?: number;
  otherAllowance?: number;
  grossSalary: number; // calculated
}

export interface PayrollSummary {
  userId: string;
  user: {
    id: string;
    name: string;
    employeeCode?: string;
    designation?: string;
  };
  salaryStructure?: SalaryStructure;
  totalWorkingDays: number;
  presentDays: number;
  paidLeaveAllowed: number;
  paidLeaveTaken: number;
  unpaidLeaveTaken: number;
  perDaySalary: number;
  deductionAmount: number;
  grossSalary: number;
  netSalary: number;
}