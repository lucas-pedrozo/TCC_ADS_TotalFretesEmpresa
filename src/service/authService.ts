import axios, { AxiosError } from "axios";

import { getApiErrorCode } from "@/utils/apiError";

const apiBaseUrl = import.meta.env.VITE_API_URL?.trim() || "/api";

const AUTH_PUBLIC_PATHS = [
  "/auth/login",
  "/auth/validate",
  "/auth/forgot-password",
  "/auth/validate-code",
  "/auth/reset-password",
  "/auth/resend-code",
] as const;

const SESSION_INVALID_NOT_FOUND_CODES = new Set([
  "ACCOUNT.NOT_FOUND",
  "COMPANY.NOT_FOUND",
  "USER.NOT_FOUND",
]);

type SessionExpiredHandler = () => void | Promise<void>;

let sessionExpiredHandler: SessionExpiredHandler | null = null;
let sessionExpiredNotified = false;

function normalizeRequestPath(url: string | undefined): string {
  if (!url) return "";

  try {
    const parsed = new URL(url, "http://local");
    return parsed.pathname;
  } catch {
    return url.split("?")[0] ?? "";
  }
}

function isAuthPublicPath(url: string | undefined): boolean {
  const path = normalizeRequestPath(url);
  return AUTH_PUBLIC_PATHS.some(
    (publicPath) => path === publicPath || path.endsWith(publicPath),
  );
}

export async function validateAuthSession(token: string): Promise<boolean> {
  try {
    const response = await axios.post<{ valid?: boolean }>(
      `${apiBaseUrl}/auth/validate`,
      { token },
    );
    return response.data?.valid === true;
  } catch {
    return false;
  }
}

export function isSessionInvalidHttpError(error: unknown): boolean {
  if (!(error instanceof AxiosError)) return false;

  const status = error.response?.status;
  const requestUrl = error.config?.url;

  if (status === 401 && !isAuthPublicPath(requestUrl)) {
    return true;
  }

  if (status === 404) {
    const code = getApiErrorCode(error);
    return code != null && SESSION_INVALID_NOT_FOUND_CODES.has(code);
  }

  return false;
}

export function registerSessionExpiredHandler(handler: SessionExpiredHandler | null) {
  sessionExpiredHandler = handler;
  sessionExpiredNotified = false;
}

export function resetSessionExpiredNotification() {
  sessionExpiredNotified = false;
}

export function notifySessionExpired() {
  if (sessionExpiredNotified || !sessionExpiredHandler) return;

  sessionExpiredNotified = true;
  void sessionExpiredHandler();
}
