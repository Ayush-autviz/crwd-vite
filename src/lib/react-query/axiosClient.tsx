// lib/axios.js
import axios from "axios";
import { useAuthStore } from "../../stores/store";

const instance = axios.create({
  timeout: 90000,
  withCredentials: true,
});

// const BaseURL = 'https://crwd.autviz.com';
// const BaseURL = 'https://api.crwdfund.org';
// const BaseURL = 'http://ec2-65-0-54-143.ap-south-1.compute.amazonaws.com:8200';
const BaseURL = "https://crwd.autviz.com";

// 🔹 Request Interceptor
instance.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token?.access_token;
  config.baseURL = BaseURL;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// 🔹 Response Interceptor
instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Prevent infinite loops
    if (error.response?.status === 403 && !originalRequest._retry) {
      originalRequest._retry = true;

      console.log("403 Forbidden - Trying to refresh token");

      try {
        const refresh_token = useAuthStore.getState().token?.refresh_token;
        const username = useAuthStore.getState().user?.username;

        const res = await axios.post(`${BaseURL}/auth/cognito/refresh/`, {
          refresh_token,
          username,
        });

        console.log("Refresh token response:", res.data);

        // Save new token
        useAuthStore
          .getState()
          .setToken({
            access_token: res.data.access_token,
            refresh_token: refresh_token,
          });

        // Update Authorization header and retry the failed request
        originalRequest.headers.Authorization = `Bearer ${res.data.access_token}`;
        return instance(originalRequest);
      } catch (refreshError) {
        console.log("Refresh token failed:", refreshError);
        useAuthStore
          .getState()
          .setToken({ access_token: "", refresh_token: "" });
        useAuthStore.getState().setUser({});
        window.location.href = "/login";
        // You can trigger navigation or logout here if needed
      }
    }

    return Promise.reject(error);
  }
);

export default instance;
