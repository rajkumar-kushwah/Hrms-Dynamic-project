import { api } from "@/api/axios";


// punch-in
export const punchIn = (data: { latitude: number; longitude: number }) => api.post("/attendance/punch-in", data);

// punch-out
export const punchOut = (data: { latitude: number; longitude: number }) =>  api.post("/attendance/punch-out", data);

// get today attendance
export const getTodayAttendance = () =>  api.get("/attendance/today");

// get my attendance history
export const getMyAttendance = (month?: number, year?: number) =>  api.get("/attendance/my-history", { params: { month, year } });

// get all attendance history
export const getAllAttendance = (date?: string) => api.get("/attendance/all", { params: { date } });

// get live attendance
export const getLiveAttendance = () => api.get("/attendance/live");