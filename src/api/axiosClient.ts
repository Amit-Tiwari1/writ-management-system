
import axios, {
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5001/api/v1";

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 30000,
});

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

let refreshPromise: Promise<string> | null = null;

const clearAuthData = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("access_token");
  }
};

const redirectToLogin = () => {
  if (typeof window !== "undefined") {
    const currentPath = window.location.pathname;

    if (currentPath !== "/" && !currentPath.includes("/login")) {
      window.location.href = "/";
    }
  }
};

axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("access_token")
        : null;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (
      typeof FormData !== "undefined" &&
      config.data instanceof FormData
    ) {
      config.headers.delete("Content-Type");
    } else if (!config.headers["Content-Type"]) {
      config.headers["Content-Type"] = "application/json";
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

axiosClient.interceptors.response.use(
  (response) => response,

  async (error: AxiosError<any>) => {
    const originalRequest = error.config as
      | CustomAxiosRequestConfig
      | undefined;

    if (!error.response || !originalRequest) {
      return Promise.reject(error);
    }

    if (error.response.status !== 401) {
      return Promise.reject(error);
    }

    const requestUrl = originalRequest.url || "";

    const excludedUrls = [
      "/auth/login",
      "/auth/refresh-token",
      "/auth/logout",
      "/auth/forgot-password",
      "/auth/reset-password",
    ];

    if (excludedUrls.some((url) => requestUrl.includes(url))) {
      return Promise.reject(error);
    }

    if (originalRequest._retry) {
      clearAuthData();
      redirectToLogin();
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      if (!refreshPromise) {
        refreshPromise = axios
          .post(
            `${API_BASE_URL}/auth/refresh-token`,
            {},
            {
              withCredentials: true,
              timeout: 30000,
            }
          )
          .then((response) => {
            const newAccessToken = response.data?.token;

            if (!newAccessToken) {
              throw new Error("New access token was not received.");
            }

            if (typeof window !== "undefined") {
              localStorage.setItem("access_token", newAccessToken);
            }

            return newAccessToken;
          })
          .finally(() => {
            refreshPromise = null;
          });
      }
      const newAccessToken = await refreshPromise;
      originalRequest.headers.Authorization =
        `Bearer ${newAccessToken}`;
      return axiosClient(originalRequest);
    } catch (refreshError) {
      const refreshStatus = (
        refreshError as AxiosError
      ).response?.status;
      if (refreshStatus === 401 || refreshStatus === 403) {
        clearAuthData();
        redirectToLogin();
      }
      return Promise.reject(refreshError);
    }
  }
);

export default axiosClient;
