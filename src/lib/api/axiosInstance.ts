import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";

const api = axios.create({
  headers: {
    "Content-Type": "application/json"
  },
  timeout: 60000,
  withCredentials: true
});

let isRefreshing = false;
let refreshSubscribers: (() => void)[] = [];

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (originalRequest.url?.includes("/auth/")) {
        return Promise.reject(error);
      }
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise<AxiosResponse>((resolve, reject) => {
          subscribeTokenRefresh(() => {
            if (originalRequest) {
              resolve(api(originalRequest));
            } else {
              reject(
                new Error(
                  "Original request config is missing after token refresh."
                )
              );
            }
          });
        });
      }

      isRefreshing = true;

      try {
        await refreshAccessToken();
        return await api(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        return Promise.reject(refreshError);
      }
    }

    if (error.response) {
      console.error("API Error:", {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      });
    } else if (error.request) {
      console.error("No response received:", error.request);
    } else {
      console.error("Request setup error:", error.message);
    }

    return Promise.reject(error);
  }
);

function subscribeTokenRefresh(cb: () => void): void {
  refreshSubscribers.push(cb);
}

function onRefreshed(): void {
  refreshSubscribers.forEach((cb) => cb());
  refreshSubscribers = [];
}

async function refreshAccessToken(): Promise<void> {
  try {
    await api.post("/api/auth/refresh");
    onRefreshed();
  } catch (error) {
    console.error("Refresh token error:", error);
    redirectToLogin("Error during refresh token request");
    throw error;
  } finally {
    isRefreshing = false;
  }
}

function redirectToLogin(errorMessage?: string): void {
  if (errorMessage) {
    console.error("Token Refresh Failed:", errorMessage);
  }
  window.location.href = "/auth/login";
}

export default api;
