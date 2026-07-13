import axios from "axios";


export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// baseURL: "https://hrms-backend-ms3u.onrender.com/api",


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
