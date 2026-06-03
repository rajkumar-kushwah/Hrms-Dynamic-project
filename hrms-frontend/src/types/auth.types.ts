// auth.types.ts

export interface SigninRequest {
    email: string;
    password: string;
}

export interface SigninResponse {
    success: boolean;
    message: string;
    data: User;
}

export interface User {
    id: number;
    name: string;
    email: string;
    role?: string;
    avatar?: string;
    lastLogin?: string;
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
}