import { AxiosError } from "axios";
import i18n from "@/i18n";

type ApiErrorResponse = {
  message?: string;
  errors?: Array<{ message?: string }>;
};

/** Chaves no estilo `FREIGHT.DELETED_SUCCESSFULLY` enviadas pela API. */
function looksLikeDottedApiMessageKey(s: string): boolean {
  return /^[A-Z][A-Z0-9_]*(?:\.[A-Z][A-Z0-9_]*)+$/.test(s);
}

export function traduzMensagemApi(message: unknown): string | undefined {
  if (typeof message !== "string") return undefined;

  const normalizedMessage = message.trim();
  if (!normalizedMessage) return undefined;

  if (i18n.exists(normalizedMessage)) {
    return i18n.t(normalizedMessage);
  }
  if (looksLikeDottedApiMessageKey(normalizedMessage)) {
    return undefined;
  }
  return normalizedMessage;
}

/**
 * Extrai uma mensagem de erro legível a partir de diferentes tipos de erro.
 *
 * @param error - O erro capturado (AxiosError, Error ou tipo desconhecido).
 * @returns Uma string com a mensagem de erro mais específica disponível.
 */
function isLikelyNetworkFailure(error: AxiosError): boolean {
  return (
    error.code === "ERR_NETWORK" ||
    error.message === "Network Error" ||
    (!error.response && Boolean(error.request))
  );
}

function isGatewayOrUpstreamError(status: number | undefined): boolean {
  return status === 502 || status === 503 || status === 504;
}

function looksLikeHtmlErrorPayload(s: string): boolean {
  const t = s.trim();
  return /^<!DOCTYPE html/i.test(t) || /^<html[\s>]/i.test(t);
}

/** Mensagem útil vinda do JSON da API (chaves `errors` ou `message`), se houver. */
function messageFromApiPayload(data: ApiErrorResponse | string | undefined): string | undefined {
  if (!data || typeof data === "string") {
    if (typeof data === "string" && !looksLikeHtmlErrorPayload(data)) {
      return traduzMensagemApi(data);
    }
    return undefined;
  }

  const fieldErrors = data.errors
    ?.map((fieldError) => traduzMensagemApi(fieldError.message))
    .filter((message): message is string => Boolean(message));

  if (fieldErrors?.length) return fieldErrors.join("\n");

  return traduzMensagemApi(data.message);
}

export function trataErroAxios(error: unknown): string {
  if (error instanceof AxiosError) {
    if (isLikelyNetworkFailure(error)) {
      if (!navigator.onLine) {
        return i18n.t("errors.offline");
      }
      return i18n.t("errors.network");
    }

    const status = error.response?.status;
    const data = error.response?.data as ApiErrorResponse | string | undefined;

    if (isGatewayOrUpstreamError(status)) {
      const fromBackend = messageFromApiPayload(data);
      if (fromBackend) return fromBackend;
      return i18n.t("errors.badGateway");
    }

    if (typeof data === "string") {
      if (looksLikeHtmlErrorPayload(data)) {
        return i18n.t("errors.badGateway");
      }
      return traduzMensagemApi(data) ?? i18n.t("errors.request");
    }

    const fromApi = messageFromApiPayload(data);
    if (fromApi) return fromApi;
    if (error.message) return error.message;

    return i18n.t("errors.request");
  }

  if (error instanceof Error) {
    return traduzMensagemApi(error.message) ?? error.message;
  }

  return i18n.t("errors.unknown");
}