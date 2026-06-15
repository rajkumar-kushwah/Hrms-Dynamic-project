import { api } from "../api/axios";
import type { CreateCompanyPayload, UpdateCompanyPayload, AssignAdminPayload } from "@/types/company.types";

export const getCompanies = () => {
  return api.get("/company");
};

export const createCompany = (data: CreateCompanyPayload) => {
  return api.post("/company", data);
};

export const updateCompany = (id: string, data: UpdateCompanyPayload) => {
  return api.put(`/company/${id}`, data);
};

export const getCompanyById = (id: string) => {
  return api.get(`/company/${id}`);
};

// delete company
export const deleteCompany = (id: string) => {
  return api.delete(`/company/${id}`);
};

// me company
export const getMyCompany = () => {
  return api.get("/company/me");
};

export const assignCompanyAdmin = ( companyId: string, data: AssignAdminPayload) => {
  return api.post(`/company/${companyId}/assign-admin`, data);
};