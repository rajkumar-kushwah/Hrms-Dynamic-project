// leaveType.service.ts
import { api } from "../api/axios";
import type { UpdateLeaveTypePayload, CreateLeaveTypePayload } from "@/types/leave.types";

export const getLeaveTypes = () => api.get("/leave-type");
export const createLeaveType = (data: CreateLeaveTypePayload ) => api.post("/leave-type", data);
export const updateLeaveType = (id: string, data: UpdateLeaveTypePayload ) => api.put(`/leave-type/${id}`, data);
export const deleteLeaveType = (id: string) => api.delete(`/leave-type/${id}`);