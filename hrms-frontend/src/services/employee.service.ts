import { api } from "../api/axios";
import type { CreateEmployeePayload, UpdateEmployeePayload } from "@/types/employee.types";

export const getEmployees = () => api.get("/employee");
export const getEmployeeById = (id: string) => api.get(`/employee/${id}`);
export const createEmployee = (data: CreateEmployeePayload) => api.post("/employee", data);
export const updateEmployee = (id: string, data: UpdateEmployeePayload) => api.put(`/employee/${id}`, data);
export const deleteEmployee = (id: string) => api.delete(`/employee/${id}`);

export const resetEmployeePassword = (id: string, password: string) =>
    api.patch(`/employee/${id}/reset-password`, { password });