import { api } from "../api/axios";
import type { CreateBranchPayload, UpdateBranchPayload } from "@/types/branch.types";

// create branch
export const createBranch = (data: CreateBranchPayload) => api.post("/branch", data);


// get all branches
export const getBranches = () => api.get("/branch");

// get single branch
export const getBranchById = (id: string) => api.get(`/branch/${id}`);


// update branch
export const updateBranch = (id: string, data: UpdateBranchPayload ) => api.put(`/branch/${id}`, data);

// delete branch
export const deleteBranch = (id: string) => api.delete(`/branch/${id}`);

// permanent delete branch
export const permanentDeleteBranch = (id: string) => api.delete(`/branch/${id}/permanent`);
