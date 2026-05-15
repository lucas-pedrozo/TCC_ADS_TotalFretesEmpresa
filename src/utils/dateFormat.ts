import type { AppLanguage } from "@/i18n/resources";

export function formatDateTimeLabel(iso: string | undefined, locale: AppLanguage): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const tag = locale === "en" ? "en-US" : "pt-BR";
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
  const tag = locale === "en" ? "en-US" : "pt-BR";
  return d.toLocaleDateString(tag, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
