import axios from "axios";
import { useAuthStore } from "../../stores/store";

const instance = axios.create({
  timeout: 90000,
  withCredentials: true,
  baseURL: import.meta.env.VITE_BASE_URL,
});

// REQUEST
instance.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token?.access_token;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// RESPONSE
instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 403 && !originalRequest?._retry) {
      originalRequest._retry = true;

      try {
        const refresh_token = useAuthStore.getState().token?.refresh_token;
        const username = useAuthStore.getState().user?.username;

        const res = await axios.post(
          `${import.meta.env.VITE_BASE_URL}/auth/cognito/refresh/`,
          { refresh_token, username }
        );

        useAuthStore.getState().setToken({
          access_token: res.data.access_token,
          refresh_token,
        });

        originalRequest.headers.Authorization =
          `Bearer ${res.data.access_token}`;

        return instance(originalRequest);

      } catch {
        useAuthStore.getState().setToken({
          access_token: "",
          refresh_token: "",
        });
        useAuthStore.getState().setUser({});
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default instance;
