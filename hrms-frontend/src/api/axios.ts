import axios from "axios";

export const api = axios.create({
  baseURL: "https://hrms-backend-ms3u.onrender.com/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});




api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (!status) {
      console.error("Network error");
      return Promise.reject(error);
    }

    return Promise.reject({
      status,
      message: error.response?.data?.message || "Request failed",
      original: error,
    });
  }
);
