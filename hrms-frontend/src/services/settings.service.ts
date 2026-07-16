import { api } from "../api/axios";
import type { UpdateSettingsPayload } from "@/types/settings.types";

export const getSettings = () => api.get("/settings");
export const updateSettings = (data: UpdateSettingsPayload) => api.put("/settings", data);