import { Check, Circle } from "lucide-react";
import { useTranslation } from "react-i18next";

import { FREIGHT_STATUS_LABEL_KEY } from "@/components/ui/freightStatusUi";
import { cn } from "@/lib/utils";
import type { AppLanguage } from "@/i18n/resources";
import type { FreightStatusSlug } from "@/types/freight";

/** Ordem do fluxo “feliz” (sem cancelado). */
const PIPELINE: readonly FreightStatusSlug[] = [
  "disponivel",
  "vinculado",
  "em_transito",
  "em_rota_entrega",
  "entregue",
  "concluido",
] as const;

export type FreightStatusTimelineEntry = {
  slug: FreightStatusSlug;
  occurredAt: string;
};

function formatStepDate(iso: string | undefined, locale: AppLanguage): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const tag = locale === "en" ? "en-US" : "pt-BR";
  return d.toLocaleDateString(tag, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function pipelineIndex(slug: FreightStatusSlug): number {
  const i = PIPELINE.indexOf(slug);
  return i >= 0 ? i : 0;
}

function resolveStepDate(
  step: FreightStatusSlug,
  index: number,
  currentIdx: number,
  opts: {
    createdAt?: string;
    updatedAt?: string;
    history?: FreightStatusTimelineEntry[];
    lang: AppLanguage;
  }
): string {
  const { createdAt, updatedAt, history, lang } = opts;
  const lastUpdated = updatedAt ?? createdAt;

  if (history && history.length > 0) {
    const hit = history.find((h) => h.slug === step);
    if (hit?.occurredAt) return formatStepDate(hit.occurredAt, lang);
    return "";
  }

  if (index === currentIdx) return formatStepDate(lastUpdated, lang);
  if (index < currentIdx && index === 0) return formatStepDate(createdAt, lang);
  return "";
}

export type FreightStatusTimelineProps = {
  slug: FreightStatusSlug;
  createdAt?: string;
  updatedAt?: string;
  /** Datas reais por status (vem do backend). Sem isso, usa o fallback antigo (createdAt / updatedAt). */
  history?: FreightStatusTimelineEntry[];
  lang: AppLanguage;
};

export function FreightStatusTimeline({
  slug,
  createdAt,
  updatedAt,
  history,
  lang,
}: FreightStatusTimelineProps) {
  const { t } = useTranslation();

  if (slug === "cancelado") {
    const cancelAt =
      history && history.length > 0
        ? [...history].reverse().find((h) => h.slug === "cancelado")?.occurredAt
        : undefined;
    const dateText = formatStepDate(cancelAt ?? updatedAt ?? createdAt, lang);
    return (
      <div
        className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        role="status"
      >
        <p>{t("pages.freightDetail.timelineCancelled")}</p>
        {dateText ? (
          <p className="mt-2 text-xs tabular-nums text-destructive/90">{dateText}</p>
        ) : null}
      </div>
    );
  }

  const currentIdx = pipelineIndex(slug);

  return (
    <div
      className="rounded-xl border border-border bg-muted/20 px-3 py-4 sm:px-5 sm:py-5"
      aria-label={t("pages.freightDetail.timelineAria")}
    >
      {/* Mobile: vertical */}
      <ol className="relative flex flex-col gap-0 md:hidden" role="list">
        {PIPELINE.map((step, index) => {
          const isPast = index < currentIdx;
          const isCurrent = index === currentIdx;
          const isFuture = index > currentIdx;
          const label = t(FREIGHT_STATUS_LABEL_KEY[step]);
          const dateText = resolveStepDate(step, index, currentIdx, {
            createdAt,
            updatedAt,
            history,
            lang,
          });

          return (
            <li
              key={step}
              className="flex gap-3"
              role="listitem"
              aria-current={isCurrent ? "step" : undefined}
            >
              <div className="relative flex w-8 shrink-0 flex-col items-center">
                {isPast ? (
                  <span className="flex size-8 items-center justify-center rounded-full bg-brand-green text-white shadow-sm">
                    <Check className="size-4" strokeWidth={2.5} aria-hidden />
                  </span>
                ) : isCurrent ? (
                  <span className="flex size-8 items-center justify-center rounded-full border-2 border-brand-green-dark bg-brand-green-light text-brand-green-dark shadow-sm ring-2 ring-brand-green/30 ring-offset-2 ring-offset-background">
                    <Circle className="size-3 fill-current" aria-hidden />
                  </span>
                ) : (
                  <span className="flex size-8 items-center justify-center rounded-full border border-border bg-background text-muted-foreground">
                    <Circle className="size-3" aria-hidden />
                  </span>
                )}
                {index < PIPELINE.length - 1 ? (
                  <span
                    className={cn(
                      "absolute top-8 bottom-0 left-1/2 w-0.5 -translate-x-1/2",
                      index < currentIdx ? "bg-brand-green/50" : "bg-border"
                    )}
                    aria-hidden
                  />
                ) : null}
              </div>
              <div className="min-w-0 flex-1 pb-6 pt-0.5 last:pb-0">
                <p
                  className={cn(
                    "text-sm font-medium leading-snug",
                    isFuture ? "text-muted-foreground" : "text-foreground"
                  )}
                >
                  {label}
                </p>
                {dateText ? (
                  <p className="mt-0.5 text-xs text-muted-foreground tabular-nums">{dateText}</p>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>

      {/* Desktop: horizontal */}
      <ol className="hidden gap-0 md:flex md:flex-row md:items-start" role="list">
        {PIPELINE.map((step, index) => {
          const isPast = index < currentIdx;
          const isCurrent = index === currentIdx;
          const isFuture = index > currentIdx;
          const label = t(FREIGHT_STATUS_LABEL_KEY[step]);
          const dateText = resolveStepDate(step, index, currentIdx, {
            createdAt,
            updatedAt,
            history,
            lang,
          });

          return (
            <li
              key={step}
              className={cn(
                "relative flex min-w-0 flex-1 flex-col items-center text-center",
                index > 0 && "md:-ml-px"
              )}
              role="listitem"
              aria-current={isCurrent ? "step" : undefined}
            >
              <div className="flex w-full items-center">
                {index > 0 ? (
                  <span
                    className={cn(
                      "h-0.5 min-w-[8px] flex-1 rounded-full",
                      index <= currentIdx ? "bg-brand-green/45" : "bg-border"
                    )}
                    aria-hidden
                  />
                ) : (
                  <span className="min-w-[8px] flex-1" aria-hidden />
                )}
                {isPast ? (
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-green text-white shadow-sm">
                    <Check className="size-4" strokeWidth={2.5} aria-hidden />
                  </span>
                ) : isCurrent ? (
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full border-2 border-brand-green-dark bg-brand-green-light text-brand-green-dark shadow-sm ring-2 ring-brand-green/25 ring-offset-2 ring-offset-background">
                    <Circle className="size-3.5 fill-current" aria-hidden />
                  </span>
                ) : (
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-background text-muted-foreground">
                    <Circle className="size-3.5" aria-hidden />
                  </span>
                )}
                {index < PIPELINE.length - 1 ? (
                  <span
                    className={cn(
                      "h-0.5 min-w-[8px] flex-1 rounded-full",
                      index < currentIdx ? "bg-brand-green/45" : "bg-border"
                    )}
                    aria-hidden
                  />
                ) : (
                  <span className="min-w-[8px] flex-1" aria-hidden />
                )}
              </div>
              <p
                className={cn(
                  "mt-2 max-w-[7.5rem] px-0.5 text-xs font-medium leading-tight sm:max-w-none sm:text-[13px]",
                  isFuture ? "text-muted-foreground" : "text-foreground"
                )}
              >
                {label}
              </p>
              {dateText ? (
                <p className="mt-1 max-w-full px-1 text-[10px] text-muted-foreground tabular-nums sm:text-xs">
                  {dateText}
                </p>
              ) : (
                <span className="mt-1 block min-h-[14px] sm:min-h-4" aria-hidden />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
