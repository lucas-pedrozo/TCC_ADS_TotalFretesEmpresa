import { AxiosError } from "axios";

type ApiErrorBody = {
  code?: string;
  message?: string;
};

export function getApiErrorCode(error: unknown): string | undefined {
  if (!(error instanceof AxiosError)) return undefined;

  const data = error.response?.data as ApiErrorBody | undefined;
  return typeof data?.code === "string" ? data.code : undefined;
}
