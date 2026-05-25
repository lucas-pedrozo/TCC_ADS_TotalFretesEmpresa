import { MapPin } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import type { AppLanguage } from "@/i18n/resources";
import { cn } from "@/lib/utils";
import type { ProposalDto } from "@/types/proposal";
import {
  formatFreightCurrencyAmount,
  formatFreightDistanceKm,
} from "@/utils/freightFormat";
import { haversineKm } from "@/utils/haversineKm";
import { formatDateTimeLabel } from "@/utils/dateFormat";
import { initialsFromName } from "@/utils/person";
import {
  getFreightFromProposal,
  isAcceptedProposalStatus,
  isPendingProposalStatus,
} from "@/utils/proposal";

type ProposalCardProps = {
  proposal: ProposalDto;
  lang: AppLanguage;
  driverName?: string | null;
};

export function ProposalCard({ proposal, lang, driverName }: ProposalCardProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const freight = getFreightFromProposal(proposal);
  const statusName = proposal.ProposalStatusType?.name ?? "";
  const isPending = isPendingProposalStatus(statusName);
  const isAccepted = isAcceptedProposalStatus(statusName);

  const driverLabel =
    driverName?.trim() || t("pages.freightDetail.driverId", { id: proposal.driver_id });

  const handleOpen = () => {
    void navigate(`/Proposals/${proposal.id}`);
  };

  if (!freight) {
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
        className="cursor-pointer rounded-xl border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md"
      >
        <p className="text-sm font-medium text-foreground">{driverLabel}</p>
        <p className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-foreground">
            {t("pages.proposals.proposalValueLabel")}
          </span>
          <span className="text-2xl font-bold tabular-nums text-brand-green-dark dark:text-brand-green-light">
            {formatFreightCurrencyAmount(proposal.value, lang)}
          </span>
        </p>
        <p className="mt-2 text-xs text-muted-foreground">{t("pages.proposals.freightUnavailable")}</p>
      </article>
    );
  }

  const distKm = haversineKm(
    freight.origin_lat,
    freight.origin_lng,
    freight.destination_lat,
    freight.destination_lng
  );

  const freightLabel =
    freight.name?.trim() || t("pages.freights.freightTitleFallback", { id: freight.id });
  const referenceValue = freight.finalValue ?? freight.originalValue ?? 0;

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
      className="flex cursor-pointer flex-col rounded-xl border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/40 sm:p-5"
    >
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className="flex size-11 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-bold text-muted-foreground"
            aria-hidden
          >
            {initialsFromName(driverLabel)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-base font-bold text-foreground">{driverLabel}</p>
            <p className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <span className="text-xs font-semibold uppercase tracking-wide text-foreground">
                {t("pages.proposals.proposalValueLabel")}
              </span>
              <span className="text-2xl font-bold leading-tight tabular-nums text-brand-green-dark dark:text-brand-green-light">
                {formatFreightCurrencyAmount(proposal.value, lang)}
              </span>
            </p>
          </div>
        </div>

        <div className="flex flex-col items-start gap-1 sm:items-end">
          <Badge
            variant="outline"
            className={cn(
              "rounded-full font-medium",
              isPending
                ? "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400"
                : isAccepted
                  ? "border-brand-green/40 bg-brand-green/10 text-brand-green-dark dark:text-brand-green-light"
                  : ""
            )}
          >
            {isPending
              ? t("pages.proposals.statusPending")
              : isAccepted
                ? t("pages.proposals.statusAccepted")
                : statusName.toLowerCase() === "recusada"
                  ? t("pages.proposals.statusRejected")
                  : statusName.toLowerCase() === "nao selecionada"
                    ? t("pages.proposals.statusNotSelected")
                    : statusName || t("pages.proposals.statusUnknown")}
          </Badge>
          <p className="text-xs text-muted-foreground">
            {t("pages.proposals.sentAt")}: {formatDateTimeLabel(proposal.createdAt, lang)}
          </p>
        </div>
      </header>

      <section className="pointer-events-none mt-4 rounded-lg border border-border/60 bg-muted/40 p-3 sm:p-4 dark:bg-muted/25">
        <p className="mb-3 text-sm font-semibold text-foreground">{freightLabel}</p>

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
              {t("pages.proposals.referenceValue")}
            </p>
            <p className="text-lg font-bold tabular-nums text-foreground">
              {formatFreightCurrencyAmount(referenceValue, lang)}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {t("pages.proposals.distance")}
            </p>
            <p className="text-lg font-bold tabular-nums text-foreground">
              {formatFreightDistanceKm(Math.round(distKm), lang)}
            </p>
          </div>
        </div>
      </section>
    </article>
  );
}
