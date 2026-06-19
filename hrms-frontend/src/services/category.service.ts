import { api } from "../api/axios";
import type { CreateCategoryPayload, UpdateCategoryPayload } from "@/types/category.types";

// get Categories
export const getCategories = () => api.get("/category");

// get Category by id
export const getCategoryById = (id: string) => api.get(`/category/${id}`);

// create Category
export const createCategory = (data: CreateCategoryPayload ) => api.post("/category", data);

// update Category
export const updateCategory = (id: string, data: UpdateCategoryPayload) => api.put(`/category/${id}`, data);

// delete Category
export const deleteCategory = (id: string) => api.delete(`/category/${id}`);