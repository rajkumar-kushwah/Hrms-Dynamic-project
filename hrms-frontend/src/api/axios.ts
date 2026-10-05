import axios from "axios";

const baseURL = import.meta.env.DEV
  ? "http://localhost:5000/api"
  : "/api";

export const api = axios.create({
 baseURL,
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
