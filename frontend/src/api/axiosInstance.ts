/// <reference types="vite/client" />
import axios from "axios"
import { clearAccessToken, getAccessToken, setAccessToken, shouldRememberAuth } from "../utils/authToken";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json"
  },
  withCredentials: true // send cookies
})

// Request Interceptor: Attach Access Token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 & Refresh Token
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as any;

    // Prevent infinite loop by checking if we already retried
    if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== '/auth/login' && originalRequest.url !== '/auth/refresh') {
      originalRequest._retry = true;

      try {
        // Attempt to refresh
        const { data } = await axios.post(
          `${axiosInstance.defaults.baseURL}/auth/refresh`,
          { rememberMe: shouldRememberAuth() },
          { withCredentials: true }
        );

        // Save new Access Token
        setAccessToken(data.accessToken, shouldRememberAuth());

        // Update header for original request and retry
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return axiosInstance(originalRequest);
      } catch (err) {
        // Refresh failed (e.g. refresh token expired or missing)
        clearAccessToken();
        // Optional: redirect to login
        window.location.href = "/login";
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance
