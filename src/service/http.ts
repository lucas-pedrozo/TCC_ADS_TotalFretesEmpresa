import axios from "axios";
import { trataErroAxios } from "@/utils/trataErroAxios";

const TOKEN_STORAGE_KEY = "authToken";

const hasLocalStorage = () => typeof window !== "undefined" && typeof window.localStorage !== "undefined";

export const getStoredAuthToken = () => {
  if (!hasLocalStorage()) {
    return null;
  }

  return localStorage.getItem(TOKEN_STORAGE_KEY);
};

export const setAuthToken = async (token: string) => {
  if (!hasLocalStorage()) {
    return;
  }

  localStorage.setItem(TOKEN_STORAGE_KEY, token);
};

export const clearAuthToken = async () => {
  if (!hasLocalStorage()) {
    return;
  }

  localStorage.removeItem(TOKEN_STORAGE_KEY);
};

export const clearAuthTokenCacheOnly = () => {
  if (!hasLocalStorage()) {
    return;
  }

  localStorage.removeItem(TOKEN_STORAGE_KEY);
};

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});


/* 
 * Request: adiciona token de autenticação se presente no localStorage
 */
http.interceptors.request.use((config) => {
  const token = getStoredAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/*
 * Response: trata erros globalmente, redireciona para login se 401 e exibe mensagem de erro 
 */
http.interceptors.response.use(
  (response) => response,
  (error) => {
    const mensagem = trataErroAxios(error);

    if (error.response?.status === 401) {
      clearAuthTokenCacheOnly();
      window.location.href = "/";
    }

    return Promise.reject(mensagem);
  }
);