// leaveRequest.service.ts
import { api } from "../api/axios";
import type { CreateLeaveRequestPayload  } from "@/types/leave.types";

// createLeaveRequest
export const createLeaveRequest = (data: CreateLeaveRequestPayload ) => api.post("/leave-request", data);

// getMyLeaveRequests
export const getMyLeaveRequests = () => api.get("/leave-request/my");

// getAllLeaveRequests
export const getAllLeaveRequests = (status?: string) => api.get("/leave-request/all", { params: { status } });

// approveRejectLeave
export const approveRejectLeave = (id: string, status: string, rejectReason?: string) =>
    api.patch(`/leave-request/${id}/status`, { status, rejectReason });

// cancelLeaveRequest
export const cancelLeaveRequest = (id: string) => api.delete(`/leave-request/${id}`);