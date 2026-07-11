import { api } from "@/api/axios";



export const getprofile = () => api.get("/auth/profile");

export const updateProfile = (data: { name?: string }) => api.put("/auth/profile", data);
export const changePassword = (data: { oldPassword: string; newPassword: string }) =>
    api.patch("/auth/profile/change-password", data);