import type { AppLanguage } from "@/i18n/resources";

const DATE_INPUT_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const DATE_DISPLAY_PATTERN = /^(\d{2})[\/.-](\d{2})[\/.-](\d{4})$/;

function getLocaleTag(locale: AppLanguage) {
  return locale === "en" ? "en-US" : "pt-BR";
}

function toValidatedDate(year: number, month: number, day: number) {
  const date = new Date(year, month - 1, day, 12);

  if (
    Number.isNaN(date.getTime()) ||
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

export function parseDateInputValue(value: string | undefined): Date | null {
  if (!value) return null;

  const normalized = normalizeDateInputValue(value);
  const match = DATE_INPUT_PATTERN.exec(normalized);

  if (!match) return null;

  const [, year, month, day] = match;
  return toValidatedDate(Number(year), Number(month), Number(day));
}

export function normalizeDateInputValue(value: string | undefined): string {
  if (!value) return "";

  const trimmed = value.trim();
  const exactMatch = DATE_INPUT_PATTERN.exec(trimmed);

  if (exactMatch) return trimmed;

  const isoDateMatch = /^(\d{4}-\d{2}-\d{2})/.exec(trimmed);
  if (isoDateMatch) return isoDateMatch[1];

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return "";

  const year = parsed.getUTCFullYear();
  const month = String(parsed.getUTCMonth() + 1).padStart(2, "0");
  const day = String(parsed.getUTCDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function formatDateInputDisplay(value: string | undefined, locale: AppLanguage): string {
  const date = parseDateInputValue(value);
  if (!date) return "";

  return date.toLocaleDateString(getLocaleTag(locale), {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function maskTypedDateDisplay(value: string | undefined): string {
  if (!value) return "";

  const digits = value.replace(/\D/g, "").slice(0, 8);

  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;

  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

export function normalizeTypedDateValue(
  value: string | undefined,
  locale: AppLanguage
): string {
  if (!value) return "";

  const trimmed = value.trim();

  if (!trimmed) return "";

  const normalizedFromIso = normalizeDateInputValue(trimmed);
  if (normalizedFromIso) return normalizedFromIso;

  const match = DATE_DISPLAY_PATTERN.exec(trimmed);
  if (!match) return "";

  const [, first, second, year] = match;
  const isEnglish = locale === "en";
  const month = isEnglish ? Number(first) : Number(second);
  const day = isEnglish ? Number(second) : Number(first);
  const date = toValidatedDate(Number(year), month, day);

  if (!date) return "";

  const normalizedMonth = String(month).padStart(2, "0");
  const normalizedDay = String(day).padStart(2, "0");

  return `${year}-${normalizedMonth}-${normalizedDay}`;
}

export function formatDateTimeLabel(iso: string | undefined, locale: AppLanguage): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const tag = getLocaleTag(locale);
  return d.toLocaleDateString(tag, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDateShortLabel(iso: string | undefined, locale: AppLanguage): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const tag = getLocaleTag(locale);
  return d.toLocaleDateString(tag, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
