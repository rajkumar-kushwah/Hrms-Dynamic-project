import { api } from "../api/axios";

import type {
    CreateHolidayPayload,
    UpdateHolidayPayload,
} from "@/types/holiday.types";

// Get all holidays
export const getHolidays = () => {
    return api.get("/holidays");
};

// Create holiday
export const createHoliday = (
    data: CreateHolidayPayload
) => {
    return api.post("/holidays", data);
};

// Update holiday
export const updateHoliday = (
    id: string,
    data: UpdateHolidayPayload
) => {
    return api.put(`/holidays/${id}`, data);
};

// Deactivate holiday
export const deactivateHoliday = (
    id: string
) => {
    return api.patch(
        `/holidays/${id}/deactivate`
    );
};

// Activate holiday
export const activateHoliday = (
    id: string
) => {
    return api.patch(
        `/holidays/${id}/activate`
    );
};