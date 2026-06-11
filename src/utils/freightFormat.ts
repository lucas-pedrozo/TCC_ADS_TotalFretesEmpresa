import type { AppLanguage } from "@/i18n/resources";

/** Mesma regra visual da listagem de fretes (`formatCurrency`). */
export function formatFreightCurrencyAmount(value: number, locale: AppLanguage): string {
  const tag = locale === "en" ? "en-US" : "pt-BR";
  const currency = locale === "en" ? "USD" : "BRL";
  return new Intl.NumberFormat(tag, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

/** Valor monetário formatado sem o símbolo da moeda (para inputs com prefixo visual). */
export function formatCurrencyInputDisplay(digits: string, locale: AppLanguage): string {
  if (!digits) return "";
  const formatted = formatFreightCurrencyAmount(centsDigitsToAmount(digits), locale);
  return formatted.replace(/^R\$\s?/u, "").replace(/^\$\s?/u, "").trim();
}

export function currencyInputPlaceholder(locale: AppLanguage): string {
  return locale === "en" ? "0.00" : "0,00";
}

export function weightInputPlaceholder(locale: AppLanguage): string {
  return locale === "en" ? "0,000" : "0.000";
}

/** Mesma regra visual da listagem (`formatWeightKg`), sem o sufixo " kg". */
export function formatFreightWeightAmount(kg: number, locale: AppLanguage): string {
  const tag = locale === "en" ? "en-US" : "pt-BR";
  return new Intl.NumberFormat(tag, { maximumFractionDigits: 0 }).format(kg);
}

export function formatFreightWeightKg(kg: number, locale: AppLanguage): string {
  return `${formatFreightWeightAmount(kg, locale)} kg`;
}

export function formatFreightDistanceKm(km: number, locale: AppLanguage): string {
  const tag = locale === "en" ? "en-US" : "pt-BR";
  const n = new Intl.NumberFormat(tag, { maximumFractionDigits: 0 }).format(km);
  return `${n} km`;
}

const MAX_CENT_DIGITS = 14;
const MAX_WEIGHT_DIGITS = 9;

export const FREIGHT_CARGO_NAME_MIN_LENGTH = 7;
export const FREIGHT_CARGO_NAME_MAX_LENGTH = 60;

/** Letras, números, espaços e pontuação comum em descrições de carga. */
export function sanitizeFreightCargoNameInput(raw: string): string {
  return raw
    .replace(/[^\p{L}\p{N}\s\-.,/()&]/gu, "")
    .replace(/\s{2,}/g, " ")
    .slice(0, FREIGHT_CARGO_NAME_MAX_LENGTH);
}

export function isFreightCargoNameValid(name: string): boolean {
  const trimmed = name.trim();
  return (
    trimmed.length >= FREIGHT_CARGO_NAME_MIN_LENGTH &&
    trimmed.length <= FREIGHT_CARGO_NAME_MAX_LENGTH
  );
}

/** Apenas dígitos, representando centavos (ex.: "1234" → R$ 12,34). */
export function sanitizeCurrencyCentsInput(raw: string): string {
  return raw.replace(/\D/g, "").slice(0, MAX_CENT_DIGITS);
}

export function centsDigitsToAmount(digits: string): number {
  if (!digits) return NaN;
  const n = Number(digits);
  if (!Number.isFinite(n)) return NaN;
  return n / 100;
}

export function amountToCentsDigits(amount: number): string {
  if (!Number.isFinite(amount)) return "";
  return String(Math.round(amount * 100));
}

/** Apenas dígitos; peso em kg inteiro, como na listagem. */
export function sanitizeWeightDigitsInput(raw: string): string {
  return raw.replace(/\D/g, "").slice(0, MAX_WEIGHT_DIGITS);
}

export function weightDigitsToKg(digits: string): number {
  if (!digits) return NaN;
  const n = Number(digits);
  return Number.isFinite(n) ? n : NaN;
}

export function kgToWeightDigits(kg: number): string {
  if (!Number.isFinite(kg)) return "";
  return String(Math.max(0, Math.round(kg)));
}
