import axios from "axios";
import i18n, { normalizeLanguage } from "@/i18n";

const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  const language = normalizeLanguage(i18n.language);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  config.headers["accept-language"] = language;

  return config;
});

http.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

export default http;