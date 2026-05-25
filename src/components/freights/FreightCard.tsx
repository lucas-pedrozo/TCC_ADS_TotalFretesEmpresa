import { MapPin, MoreHorizontal, Package } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  FREIGHT_STATUS_LABEL_KEY,
  resolveFreightStatusSlug,
  statusBadgeClass,
} from "@/components/ui/freightStatusUi";
import type { AppLanguage } from "@/i18n/resources";
import { cn } from "@/lib/utils";
import type { FreightDto } from "@/types/freight";
import { formatDateShortLabel } from "@/utils/dateFormat";
import {
  formatFreightCurrencyAmount,
  formatFreightDistanceKm,
  formatFreightWeightKg,
} from "@/utils/freightFormat";
import { haversineKm } from "@/utils/haversineKm";

type FreightCardProps = {
  freight: FreightDto;
  lang: AppLanguage;
  onDelete?: (freight: FreightDto) => void;
};

export function FreightCard({ freight, lang, onDelete }: FreightCardProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const slug = resolveFreightStatusSlug({
    statusId: freight.status_id,
    statusName: freight.FreightStatusType?.name ?? freight.status?.name,
  });

  const distKm = haversineKm(
    freight.origin_lat,
    freight.origin_lng,
    freight.destination_lat,
    freight.destination_lng
  );

  const freightLabel =
    freight.name?.trim() || t("pages.freights.freightTitleFallback", { id: freight.id });
  const cargoName = freight.CargoType?.name ?? freight.cargo?.name ?? "—";
  const displayValue = freight.finalValue ?? freight.originalValue;

  const handleOpen = () => {
    void navigate(`/Freights/${freight.id}`);
  };

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={handleOpen}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          handleOpen();
        }
      }}
      aria-label={t("pages.freights.openFreightAria")}
      className="flex cursor-pointer flex-col rounded-xl border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/40 sm:p-5"
    >
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <div
            className="flex size-11 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground"
            aria-hidden
          >
            <Package className="size-5" strokeWidth={2} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-bold text-foreground">{freightLabel}</p>
            <p className="truncate text-sm text-muted-foreground">{cargoName}</p>
            <p className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <span className="text-xs font-semibold uppercase tracking-wide text-foreground">
                {t("pages.freights.freightValueLabel")}
              </span>
              <span className="text-2xl font-bold leading-tight tabular-nums text-brand-green-dark dark:text-brand-green-light">
                {formatFreightCurrencyAmount(displayValue, lang)}
              </span>
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-start gap-2 self-start sm:flex-col sm:items-end">
          <div className="flex flex-col items-start gap-1 sm:items-end">
            <Badge
              variant="outline"
              className={cn("rounded-full font-medium", statusBadgeClass(slug))}
            >
              {t(FREIGHT_STATUS_LABEL_KEY[slug])}
            </Badge>
            <p className="text-xs text-muted-foreground">
              {formatDateShortLabel(freight.createdAt, lang)}
            </p>
          </div>

          <div onClick={(event) => event.stopPropagation()} onKeyDown={(event) => event.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger
                className={cn(
                  buttonVariants({ variant: "ghost", size: "icon-sm" }),
                  "size-9 shrink-0 rounded-lg"
                )}
                aria-label={t("pages.freights.actionMenuLabel")}
              >
                <MoreHorizontal className="size-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-40">
                <DropdownMenuItem onClick={() => void navigate(`/Freights/${freight.id}`)}>
                  {t("pages.freights.actionEdit")}
                </DropdownMenuItem>
                {onDelete ? (
                  <DropdownMenuItem variant="destructive" onClick={() => onDelete(freight)}>
                    {t("pages.freightDetail.delete")}
                  </DropdownMenuItem>
                ) : null}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <section className="pointer-events-none mt-4 rounded-lg border border-border/60 bg-muted/40 p-3 sm:p-4 dark:bg-muted/25">
        <div className="mb-4 space-y-2 text-sm">
          <p className="flex items-start gap-2 text-foreground">
            <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
            <span className="min-w-0 break-words">{freight.origin_label}</span>
          </p>
          <p className="flex items-start gap-2 text-muted-foreground">
            <span className="w-4 shrink-0 text-center" aria-hidden>
              →
            </span>
            <span className="min-w-0 break-words">{freight.destination_label}</span>
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 border-t border-border/50 pt-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {t("pages.freights.columnWeight")}
            </p>
            <p className="text-lg font-bold tabular-nums text-foreground">
              {freight.weight == null ? "—" : formatFreightWeightKg(freight.weight, lang)}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {t("pages.freights.columnDistance")}
            </p>
            <p className="text-lg font-bold tabular-nums text-foreground">
              {formatFreightDistanceKm(Math.round(distKm), lang)}
            </p>
          </div>
        </div>

        {freight.assignedDriver_id != null ? (
          <p className="mt-3 border-t border-border/50 pt-3 text-xs text-muted-foreground">
            {t("pages.freights.columnName")}:{" "}
            <span className="font-medium text-foreground">
              {t("pages.freightDetail.driverId", { id: freight.assignedDriver_id })}
            </span>
          </p>
        ) : null}
      </section>
    </article>
  );
}
