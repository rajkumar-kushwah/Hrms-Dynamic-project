import { api } from "../api/axios";
import type { CreateRolePayload, UpdateRolePayload } from "@/types/role.types";

// Get All Roles
export const getRoles = () => {
  return api.get("/roles");
};

// Get Modules
export const getModules = () => {
  return api.get("/roles/modules");
};

// Get Role By Id
export const getRoleById = (id: number) => {
  return api.get(`/roles/${id}`);
};

// Create Role
export const createRole = (data: CreateRolePayload) => {
  return api.post("/roles", data);
};

// Update Role
export const updateRole = (
  id: number,
  data: UpdateRolePayload
) => {
  return api.put(`/roles/${id}`, data);
};

// Delete Role
export const deleteRole = (id: number) => {
  return api.delete(`/roles/${id}/permissions`);
};