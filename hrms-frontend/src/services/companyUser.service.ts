import { api } from "../api/axios";



// getUsers company
// const res = await api.get("/api/users");

export const getCompanyUsers = () => {
    return api.get("/api/users");
};

// fatch toggle 
// const res = await api.patch(`/api/users/${user.id}/toggle-status`);

export const toggleUserStatus = (id: number) => {
    return api.patch(`/api/users/${id}/toggle-status`);
};

// reset password 
//  await api.patch(`/users/${selectedUser.id}/reset-password`, { password: newPassword, });

export const resetUserPassword = (id: number, password: string) => {
    return api.patch(`/api/users/${id}/reset-password`, { password });
};