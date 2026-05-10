import { AxiosError } from "axios";
import i18n from "@/i18n";

type ApiErrorResponse = {
  message?: string;
  errors?: Array<{ message?: string }>;
};

export function traduzMensagemApi(message: unknown): string | undefined {
  if (typeof message !== "string") return undefined;

  const normalizedMessage = message.trim();
  if (!normalizedMessage) return undefined;

  return i18n.exists(normalizedMessage)
    ? i18n.t(normalizedMessage)
    : normalizedMessage;
}

/**
 * Extrai uma mensagem de erro legível a partir de diferentes tipos de erro.
 *
 * @param error - O erro capturado (AxiosError, Error ou tipo desconhecido).
 * @returns Uma string com a mensagem de erro mais específica disponível.
 */
export function trataErroAxios(error: unknown): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiErrorResponse | string | undefined;

    if (typeof data === "string") {
      return traduzMensagemApi(data) ?? i18n.t("errors.request");
    }

    const fieldErrors = data?.errors
      ?.map((fieldError) => traduzMensagemApi(fieldError.message))
      .filter((message): message is string => Boolean(message));

    if (fieldErrors?.length) return fieldErrors.join("\n");

    const translatedMessage = traduzMensagemApi(data?.message);
    if (translatedMessage) return translatedMessage;
    if (error.message) return error.message;

    return i18n.t("errors.request");
  }

  if (error instanceof Error) {
    return traduzMensagemApi(error.message) ?? error.message;
  }

  return i18n.t("errors.unknown");
}