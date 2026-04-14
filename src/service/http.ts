import axios from "axios";
import { trataErroAxios } from "@/utils/trataErroAxios";

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
  const token = localStorage.getItem("token");
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
      localStorage.removeItem("token");
      window.location.href = "/login";
    }

    return Promise.reject(mensagem);
  }
);