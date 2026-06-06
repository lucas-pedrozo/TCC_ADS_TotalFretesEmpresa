import type { AppLanguage } from "@/i18n/resources";

import {
  formatFreightCurrencyAmount,
  formatFreightWeightKg,
} from "./freightFormat";

export function resolveSelectLabel(
  selectedId: string | number | null | undefined,
  options: Array<{ id: number; label: string }>,
  fallbackLabel?: string | null
): string | undefined {
  if (selectedId === "" || selectedId == null) {
    return fallbackLabel ?? undefined;
  }

  const match = options.find((option) => String(option.id) === String(selectedId));
  return match?.label ?? fallbackLabel ?? undefined;
}

export function formatAdminCurrency(
  value: number | null | undefined,
  locale: AppLanguage
): string {
  if (value == null || Number.isNaN(value)) return "—";
  return formatFreightCurrencyAmount(value, locale);
}

export function formatAdminWeightKg(
  kg: number | null | undefined,
  locale: AppLanguage
): string {
  if (kg == null || Number.isNaN(kg)) return "—";
  return formatFreightWeightKg(kg, locale);
}

export function formatVehicleLengthMeters(lengthCm: number | null | undefined): string {
  if (lengthCm == null || Number.isNaN(lengthCm)) return "—";
  return `${(lengthCm / 100).toLocaleString(undefined, {
    maximumFractionDigits: 2,
  })} m`;
}

export function sanitizeAdminDigitsInput(raw: string, maxLength = 12): string {
  return raw.replace(/\D/g, "").slice(0, maxLength);
}

export function formatAdminIntegerDisplay(value: string | number | null | undefined): string {
  if (value === "" || value == null) return "";
  const digits = String(value).replace(/\D/g, "");
  if (!digits) return "";
  const parsed = Number(digits);
  return Number.isFinite(parsed) ? parsed.toLocaleString() : digits;
}
