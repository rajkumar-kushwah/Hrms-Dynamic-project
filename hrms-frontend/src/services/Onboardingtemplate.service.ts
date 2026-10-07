// services/onboardingTemplate.service.ts
import { api } from "../api/axios";

export const getChecklistTemplates = () =>
    api.get("/onboarding-template");

export const createChecklistItem = (data: {
    stage: string;
    title: string;
    description?: string;
    isRequired?: boolean;
    requiresDocument?: boolean;
}) => api.post("/onboarding-template", data);

export const updateChecklistItem = (
    id: string,
    data: {
        title?: string;
        description?: string;
        isRequired?: boolean;
        requiresDocument?: boolean;
    }
) => api.patch(`/onboarding-template/${id}`, data);

export const deleteChecklistItem = (id: string) =>
    api.delete(`/onboarding-template/${id}`);

export const reorderChecklistItems = (stage: string, orderedIds: string[]) =>
    api.post("/onboarding-template/reorder", { stage, orderedIds });