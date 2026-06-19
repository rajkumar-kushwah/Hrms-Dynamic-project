
export interface Category {
    id: string;
    name: string;
    description?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    branch?: {
        id: string;
        name: string;
    }
    company?: {
        id: string;
        name: string;
    }
}

export interface CreateCategoryPayload {
    name: string;
    description?: string;
    branchId: string;
}

export interface UpdateCategoryPayload {
    name?: string;
    description?: string;
    isActive?: boolean;
}