

// lib/axios.js
import axios from 'axios';
import { useAuthStore } from '../../stores/store';

const instance = axios.create({
  timeout: 90000,
  withCredentials: true,
});

instance.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token?.access_token;

  // config.baseURL = 'https://f7ncsbkq-8000.inc1.devtunnels.ms'
  config.baseURL = 'https://crwd.autviz.com'


  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  console.log(token, 'token in interceptor');

  return config;
});

export default instance;