import { api } from "../api/axios";
import type { CreateCompanyPayload, UpdateCompanyPayload } from "@/types/company.types";

export const getCompanies = () => {
  return api.get("/api/company");
};

export const createCompany = (data: CreateCompanyPayload) => {
  return api.post("/api/company", data);
};

export const updateCompany = (id: string, data: UpdateCompanyPayload) => {
  return api.put(`/api/company/${id}`, data);
};

export const getCompanyById = (id: string) => {
  return api.get(`/api/company/${id}`);
};

// delete company
export const deleteCompany = (id: string) => {
  return api.delete(`/api/company/${id}`);
};