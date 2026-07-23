export interface LeaveType {
  id: string;
  name: string;
  description?: string;
  daysPerYear: number;
  isActive: boolean;
}

export interface LeaveRequest {
  id: string;
  userId: string;
  leaveTypeId: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason?: string;
  status: "Pending" | "Approved" | "Rejected";
  rejectReason?: string;
  createdAt: string;
  leaveType?: { id: string; name: string };
  user?: { id: string; name: string; employeeCode?: string; designation?: string };
  approvedByUser?: { id: string; name: string };
}
export interface CreateLeaveTypePayload {
  name: string;
  description?: string;
  daysPerYear: number;
}

export interface UpdateLeaveTypePayload {
  name: string;
  description?: string;
  daysPerYear: number;
}

export interface CreateLeaveRequestPayload {
  leaveTypeId: string;
  startDate: string;
  endDate: string;
  reason?: string;
}

export interface UpdateLeaveRequestPayload {
  leaveTypeId: string;
  startDate: string;
  endDate: string;
  reason?: string;
}