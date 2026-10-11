import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import Cookies from "js-cookie";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api/v1";

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Cookies automatically send/receive karne ke liye
  timeout: 30000,
});

// Request Interceptor: Attach JWT Bearer Token dynamically
axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = Cookies.get("access_token") || (typeof window !== "undefined" ? localStorage.getItem("access_token") : null);
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Agar FormData bhej rahe hain (DMS file uploads), toh browser ko khud boundary set karne do
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    } else if (!config.headers["Content-Type"]) {
      config.headers["Content-Type"] = "application/json";
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Response Interceptor: Global 401 handling
axiosClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<any>) => {
    if (error.response?.status === 401) {
      Cookies.remove("access_token");
      if (typeof window !== "undefined") {
        localStorage.removeItem("access_token");
        if (window.location.pathname !== "/" && !window.location.pathname.includes("/login")) {
          window.location.href = "/";
        }
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;