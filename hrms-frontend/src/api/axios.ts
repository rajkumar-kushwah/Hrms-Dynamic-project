import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:5000",
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
