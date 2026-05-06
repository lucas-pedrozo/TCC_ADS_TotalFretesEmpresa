import { AxiosError } from "axios";
import i18n from "@/i18n";

/**
 * Extrai uma mensagem de erro legível a partir de diferentes tipos de erro.
 *
 * @param error - O erro capturado (AxiosError, Error ou tipo desconhecido).
 * @returns Uma string com a mensagem de erro mais específica disponível.
 */
export function trataErroAxios(error: unknown): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data;

    if (typeof data === "string" && data.trim()) return data;
    if (typeof data?.message === "string" && data.message.trim()) return data.message;
    if (error.message) return error.message;

    return i18n.t("errors.request");
  }

  if (error instanceof Error) {
    return error.message;
  }

  return i18n.t("errors.unknown");
}