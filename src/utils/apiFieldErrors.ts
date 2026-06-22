import { AxiosError, isAxiosError } from "axios";
import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { traduzMensagemApi } from "@/utils/trataErroAxios";

export type ApiFieldIssue = {
  field: string;
  message: string;
};

type ApiErrorPayload = {
  message?: string;
  type?: string;
  conflicts?: Array<{ field?: string; message?: string }>;
  issues?: Array<{ field?: string; message?: string }>;
  errors?: Array<{ message?: string }>;
};

function normalizeFieldIssues(
  items: Array<{ field?: string; message?: string }> | undefined,
): ApiFieldIssue[] {
  if (!items?.length) return [];

  return items
    .map((item) => {
      const field = typeof item.field === "string" ? item.field.trim() : "";
      const message = traduzMensagemApi(item.message) ?? item.message?.trim();
      if (!field || !message) return null;
      return { field, message };
    })
    .filter((item): item is ApiFieldIssue => item !== null);
}

function buildSummary(
  payload: ApiErrorPayload | undefined,
  fieldErrors: ApiFieldIssue[],
): string | undefined {
  const translatedMessage = traduzMensagemApi(payload?.message);
  if (translatedMessage) return translatedMessage;

  if (fieldErrors.length > 0) {
    return fieldErrors.map((item) => item.message).join("\n");
  }

  const legacyErrors = payload?.errors
    ?.map((item) => traduzMensagemApi(item.message))
    .filter((message): message is string => Boolean(message));

  if (legacyErrors?.length) return legacyErrors.join("\n");

  return undefined;
}

export function parseApiFieldErrors(error: unknown): {
  summary: string;
  fieldErrors: ApiFieldIssue[];
} | null {
  if (!isAxiosError(error)) return null;

  const payload = error.response?.data as ApiErrorPayload | string | undefined;
  if (!payload || typeof payload === "string") return null;

  const fieldErrors = [
    ...normalizeFieldIssues(payload.conflicts),
    ...normalizeFieldIssues(payload.issues),
  ];

  const summary = buildSummary(payload, fieldErrors);
  if (!summary && fieldErrors.length === 0) return null;

  return {
    summary: summary ?? fieldErrors[0]?.message ?? "",
    fieldErrors,
  };
}

export function applyRhfFieldErrors<TFieldValues extends FieldValues>(
  setError: UseFormSetError<TFieldValues>,
  fieldErrors: ApiFieldIssue[],
  fieldMap?: Record<string, Path<TFieldValues>>,
): void {
  for (const issue of fieldErrors) {
    const fieldName = (fieldMap?.[issue.field] ?? issue.field) as Path<TFieldValues>;
    setError(fieldName, { type: "server", message: issue.message });
  }
}

export function mapFieldErrorsToRecord(
  fieldErrors: ApiFieldIssue[],
  fieldMap?: Record<string, string>,
): Record<string, string> {
  return fieldErrors.reduce<Record<string, string>>((acc, issue) => {
    const fieldName = fieldMap?.[issue.field] ?? issue.field;
    acc[fieldName] = issue.message;
    return acc;
  }, {});
}

export function getAxiosErrorPayload(error: unknown): ApiErrorPayload | undefined {
  if (!isAxiosError(error)) return undefined;
  const data = error.response?.data;
  if (!data || typeof data !== "object") return undefined;
  return data as ApiErrorPayload;
}

export function isAxiosConflictError(error: unknown): boolean {
  return isAxiosError(error) && error.response?.status === 409;
}
