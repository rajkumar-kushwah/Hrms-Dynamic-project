import { api } from "@/api/axios";



export const getprofile = () => api.get("/auth/profile");