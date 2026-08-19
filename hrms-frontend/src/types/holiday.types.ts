export interface HolidayType {
    id: string;
    companyId: string;
    name: string;
    date: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateHolidayPayload {
    name: string;
    date: string;
    isActive?: boolean;
}

export interface UpdateHolidayPayload {
    name?: string;
    date?: string;
    isActive?: boolean;
}