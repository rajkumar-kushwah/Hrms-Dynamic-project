export interface CompanyUser {
    id: number;
    name: string;
    email: string;
    isActive: boolean;
    createdAt: string;
    company: { id: string; name: string; code: string } | null;
    role: { id: number; name: string } | null;
}