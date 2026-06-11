import axios from "axios";
import i18n, { normalizeLanguage } from "@/i18n";
import {
  isSessionInvalidHttpError,
  notifySessionExpired,
} from "@/service/authService";

const apiBaseUrl = import.meta.env.VITE_API_URL?.trim() || "/api";

const http = axios.create({
  baseURL: apiBaseUrl,
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");
  const language = normalizeLanguage(i18n.language);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  config.headers["accept-language"] = language;

  return config;
});

http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (isSessionInvalidHttpError(error)) {
      notifySessionExpired();
    }
    return Promise.reject(error);
  },
);

export default http;