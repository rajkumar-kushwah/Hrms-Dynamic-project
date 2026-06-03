import { api } from "@/api/axios";


import { type  SigninRequest } from "@/types/auth.types";


// signin user
export const signinUser = async (data:  SigninRequest ) => { const response = await api.post("/auth/signin", data); return response.data }