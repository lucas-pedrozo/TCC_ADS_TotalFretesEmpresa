import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  MapPin,
  Package,
  Tag,
  X,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FREIGHT_STATUS_LABEL_KEY,
  resolveFreightStatusSlug,
  statusBadgeClass,
} from "@/components/ui/freightStatusUi";
import { useProposalDetail } from "@/hooks/useProposalDetail";
import type { AppLanguage } from "@/i18n/resources";
import { cn } from "@/lib/utils";
import {
  formatFreightCurrencyAmount,
  formatFreightDistanceKm,
} from "@/utils/freightFormat";
import { haversineKm } from "@/utils/haversineKm";
import { formatDateTimeLabel } from "@/utils/dateFormat";
import { initialsFromName } from "@/utils/person";
import { isAcceptedProposalStatus, isPendingProposalStatus } from "@/utils/proposal";

const cardShell = "rounded-xl border border-border bg-card shadow-sm";

const ProposalDetailPage = () => {
  const { proposalId } = useParams<{ proposalId: string }>();
  const { t, i18n } = useTranslation();
  const lang = i18n.language as AppLanguage;

  const {
    proposal,
    freight,
    driverProfile,
    loading,
    actionLoading,
    canActOnProposal,
    handleAccept,
    handleReject,
    goBack,
    openFreight,
  } = useProposalDetail({ proposalId });

  if (loading) {
    return (
      <div className="flex min-h-0 flex-1 flex-col gap-4 p-3 sm:p-4 md:p-6">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-[280px] rounded-xl" />
        <Skeleton className="h-[220px] rounded-xl" />
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
        <p className="text-sm text-muted-foreground">{t("pages.proposalDetail.notFound")}</p>
        <Button type="button" variant="outline" onClick={goBack}>
          <ArrowLeft className="mr-2 size-4" aria-hidden />
          {t("pages.proposalDetail.back")}
        </Button>
      </div>
    );
  }

  const statusName = proposal.ProposalStatusType?.name ?? "";
  const isPending = isPendingProposalStatus(statusName);
  const isAccepted = isAcceptedProposalStatus(statusName);
  const driverLabel =
    driverProfile?.name?.trim() ||
    t("pages.freightDetail.driverId", { id: proposal.driver_id });
  const vehicleLabel =
    driverProfile?.vehicle?.trim() || t("pages.freightDetail.vehicleUnavailable");

  const distKm = freight
    ? haversineKm(
        freight.origin_lat,
        freight.origin_lng,
        freight.destination_lat,
        freight.destination_lng
      )
    : 0;

  const freightSlug = freight
    ? resolveFreightStatusSlug({
        statusId: freight.status_id,
        statusName: freight.FreightStatusType?.name ?? freight.status?.name,
      })
    : "disponivel";

  const freightLabel = freight
    ? freight.name?.trim() || t("pages.freights.freightTitleFallback", { id: freight.id })
    : t("pages.proposals.freightUnavailable");

  const referenceValue = freight ? (freight.finalValue ?? freight.originalValue ?? 0) : 0;
  const cargoName =
    freight?.CargoType?.name ?? freight?.cargo?.name ?? t("pages.proposalDetail.cargoUnavailable");

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-4 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:p-4 md:p-6">
      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" variant="outline" size="sm" className="rounded-lg" onClick={goBack}>
          <ArrowLeft className="mr-2 size-4" aria-hidden />
          {t("pages.proposalDetail.back")}
        </Button>
        <h1 className="text-lg font-bold text-foreground sm:text-xl">
          {t("pages.proposalDetail.title", { id: proposal.id })}
        </h1>
      </div>

      <section className={cn(cardShell, "p-4 sm:p-5")}>
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className="flex size-12 items-center justify-center rounded-full bg-muted text-sm font-bold text-muted-foreground"
              aria-hidden
            >
              {initialsFromName(driverLabel)}
            </div>
            <div>
              <p className="text-base font-bold text-foreground">{driverLabel}</p>
              <p className="text-sm text-muted-foreground">{vehicleLabel}</p>
            </div>
          </div>
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
                : statusName || t("pages.proposals.statusUnknown")}
          </Badge>
        </div>

        <div className="grid grid-cols-1 gap-4 border-t border-border pt-4 sm:grid-cols-2">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {t("pages.freightDetail.proposalValueLabel")}
            </p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-brand-green-dark dark:text-brand-green-light">
              {formatFreightCurrencyAmount(proposal.value, lang)}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {t("pages.freightDetail.proposalSentAtLabel")}
            </p>
            <p className="mt-1 flex items-center gap-1.5 text-lg font-bold tabular-nums text-foreground">
              <CalendarDays className="size-4 text-muted-foreground" aria-hidden />
              {formatDateTimeLabel(proposal.createdAt, lang)}
            </p>
          </div>
        </div>

        {canActOnProposal ? (
          <div className="mt-5 flex flex-col gap-2 border-t border-border pt-5 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className="min-h-11 w-full gap-2 rounded-lg border-destructive/70 text-destructive hover:bg-destructive/10 sm:min-h-10 sm:w-auto"
              disabled={actionLoading}
              onClick={() => void handleReject()}
            >
              <X className="size-4 shrink-0" aria-hidden />
              {t("pages.freightDetail.rejectProposal")}
            </Button>
            <Button
              type="button"
              className="min-h-11 w-full gap-2 rounded-lg bg-brand-green text-white hover:bg-brand-green-dark sm:min-h-10 sm:w-auto"
              disabled={actionLoading}
              onClick={() => void handleAccept()}
            >
              <Check className="size-4 shrink-0" aria-hidden />
              {t("pages.freightDetail.acceptProposal")}
            </Button>
          </div>
        ) : null}
      </section>

      {freight ? (
        <section
          role="button"
          tabIndex={0}
          onClick={openFreight}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              openFreight();
            }
          }}
          className={cn(
            cardShell,
            "cursor-pointer p-4 transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/40 sm:p-5"
          )}
        >
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-foreground">{t("pages.proposalDetail.linkedFreight")}</h2>
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-brand-green-dark dark:text-brand-green-light">
              {t("pages.proposalDetail.openFreight")}
              <ArrowRight className="size-4" aria-hidden />
            </span>
          </div>

          <div className="mb-4 flex flex-wrap items-center gap-2">
            <Badge variant="outline" className={cn("rounded-full font-medium", statusBadgeClass(freightSlug))}>
              {t(FREIGHT_STATUS_LABEL_KEY[freightSlug])}
            </Badge>
            <span className="text-base font-bold text-foreground">{freightLabel}</span>
          </div>

          <div className="mb-4 space-y-2 text-sm">
            <p className="flex items-start gap-2 text-foreground">
              <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
              <span className="min-w-0 break-words">{freight.origin_label}</span>
            </p>
            <p className="flex items-start gap-2 text-muted-foreground">
              <span className="w-4 shrink-0 text-center" aria-hidden>
                →
              </span>
              <span className="min-w-0 break-words">
                {freight.destination_label}
                <span className="text-muted-foreground">
                  {" "}
                  · {formatFreightDistanceKm(Math.round(distKm), lang)}
                </span>
              </span>
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 border-t border-border pt-4 sm:grid-cols-3">
            <div className="flex items-start gap-2">
              <Package className="mt-0.5 size-4 text-muted-foreground" aria-hidden />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {t("pages.proposalDetail.cargoType")}
                </p>
                <p className="text-sm font-medium text-foreground">{cargoName}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Tag className="mt-0.5 size-4 text-muted-foreground" aria-hidden />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {t("pages.proposals.referenceValue")}
                </p>
                <p className="text-sm font-bold tabular-nums text-foreground">
                  {formatFreightCurrencyAmount(referenceValue, lang)}
                </p>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {t("pages.proposals.distance")}
              </p>
              <p className="text-sm font-medium text-foreground">
                {formatFreightDistanceKm(Math.round(distKm), lang)}
              </p>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
};

export default ProposalDetailPage;
