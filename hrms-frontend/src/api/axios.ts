import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:5000",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const status = error.response?.status;

    switch (status) {
      case 401:
        logout();
        window.location.href = "/signin";
        break;
      case 403:
        window.location.href = "/unauthorized";
        break;
      case 404:
        window.location.href = "/not-found";
        break;
      case 500:
        window.location.href = "/server-error";
        break;
      default: 
    }

      // optional: clear store
      // useAuthStore.getState().logout();
    

    return Promise.reject(error);
  }
);

function logout() {
  throw new Error("Function not implemented.");
}
