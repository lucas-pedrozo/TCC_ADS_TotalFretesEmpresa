import { AxiosError } from "axios";

export function trataErroAxios(error: unknown): string {
  if (error instanceof AxiosError) {
    return error.response?.data?.message
      ?? error.response?.data
      ?? error.message
      ?? "Erro na requisição";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Erro desconhecido";
}