import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://atsen.app/api",
});

// Debug logging for environment
console.log('API Base URL:', import.meta.env.VITE_API_URL || "https://atsen.app/api");
console.log('Environment:', import.meta.env.MODE);

// Attach token automatically
api.interceptors.request.use(config => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
