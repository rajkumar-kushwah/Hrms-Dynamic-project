import { api } from "../api/axios";

export const getOnboardingList = async (status?: string) => {
    const response = await api.get("/onboarding", {
        params: status ? { status } : undefined,
    });

    return response.data;
};

export const getOnboardingDetail = async (userId: string) => {
    const response = await api.get(`/onboarding/${userId}`);

    return response.data;
};

export const startOnboarding = async (userId: string) => {
    const response = await api.post(`/onboarding/start/${userId}`);

    return response.data;
};

export const toggleChecklistItem = async (itemId: string) => {
    const response = await api.patch(
        `/onboarding/item/${itemId}/toggle`
    );

    return response.data;
};

export const setOnboardingStage = async (
    userId: string,
    stage: string
) => {
    const response = await api.patch(
        `/onboarding/${userId}/stage`,
        { stage }
    );

    return response.data;
};

export const setOnboardingStatus = async (
    userId: string,
    status: "IN_PROGRESS" | "ON_HOLD"
) => {
    const response = await api.patch(
        `/onboarding/${userId}/status`,
        { status }
    );

    return response.data;
};