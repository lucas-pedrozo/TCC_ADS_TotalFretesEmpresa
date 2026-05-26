import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowLeft,
  ArrowRight,
  Ban,
  CalendarDays,
  Check,
  MapPin,
  Package,
  Scale,
  Tag,
  Truck,
  User,
  X,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import { FreightForm } from "@/components/ui/freightForm";
import { AddressMapPicker, type MapPinValue } from "@/components/maps/AddressMapPicker";
import {
  FREIGHT_STATUS_LABEL_KEY,
  resolveFreightStatusSlug,
  statusBadgeClass,
} from "@/components/ui/freightStatusUi";
import { FreightStatusTimeline } from "@/components/ui/freightStatusTimeline";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { AppLanguage } from "@/i18n/resources";
import { useFreightDetail } from "@/hooks/useFreightDetail";
import { cn } from "@/lib/utils";
import type {
  FreightCargoStepBody,
  FreightUpdateBody,
} from "@/types/freight";
import {
  formatFreightCurrencyAmount,
  formatFreightDistanceKm,
  formatFreightWeightKg,
} from "@/utils/freightFormat";
import { haversineKm } from "@/utils/haversineKm";
import { isValidMapPin } from "@/utils/freightCreate";
import { formatDateTimeLabel } from "@/utils/dateFormat";
import { initialsFromName } from "@/utils/person";

function DetailField({
  icon: Icon,
  label,
  children,
  sub,
}: {
  icon: LucideIcon;
  label: string;
  children: ReactNode;
  sub?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2.5">
      <div
        className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground"
        aria-hidden
      >
        <Icon className="size-[18px]" strokeWidth={2} />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="mt-1 text-sm font-bold leading-snug text-foreground">{children}</p>
        {sub ? (
          <p className="mt-1 text-xs font-normal leading-snug text-muted-foreground tabular-nums">{sub}</p>
        ) : null}
      </div>
    </div>
  );
}

function ValueSummaryRow({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: ReactNode;
  valueClassName?: string;
}) {
  return (
    <div className="flex justify-between gap-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn("shrink-0 text-right font-semibold tabular-nums text-foreground", valueClassName)}>
        {value}
      </span>
    </div>
  );
}

const cardShell = "rounded-xl border border-border bg-card shadow-sm";
const MAPBOX_PK = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN?.trim() ?? "";

const FreightDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const lang = i18n.language as AppLanguage;
  const navigate = useNavigate();

  const [editing, setEditing] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [editOrigin, setEditOrigin] = useState<MapPinValue | null>(null);
  const [editDestination, setEditDestination] = useState<MapPinValue | null>(null);
  const {
    freight,
    cargoTypes,
    statusTypes,
    loading,
    saving,
    deleting,
    cancelling,
    completing,
    statusTimelineHistory,
    proposals,
    bestProposal,
    driverProfilesById,
    proposalActionId,
    handleUpdate,
    handleDelete,
    handleCancelFreight,
    handleCompleteFreight,
    handleAcceptProposal,
    handleRejectProposal,
  } = useFreightDetail({ id });

  useEffect(() => {
    if (!editing || !freight) return;
    setEditOrigin({
      label: freight.origin_label,
      lat: freight.origin_lat,
      lng: freight.origin_lng,
    });
    setEditDestination({
      label: freight.destination_label,
      lat: freight.destination_lat,
      lng: freight.destination_lng,
    });
  }, [editing, freight]);

  if (!id) {
    return null;
  }

  if (loading && !freight) {
    return (
      <div className="flex min-h-0 min-w-0 flex-1 flex-col p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:p-4 md:p-6">
        <p className="text-sm text-muted-foreground">{t("pages.freightDetail.loading")}</p>
      </div>
    );
  }

  if (!freight) {
    return (
      <div className="flex min-h-0 min-w-0 flex-1 flex-col p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:p-4 md:p-6">
        <Button variant="outline" className="w-fit rounded-lg" onClick={() => navigate("/Freights")}>
          {t("pages.freightDetail.back")}
        </Button>
        <p className="mt-4 text-sm text-muted-foreground">{t("pages.freightDetail.notFound")}</p>
      </div>
    );
  }

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
  const displayValue = freight.finalValue ?? freight.originalValue;
  const weightKg = freight.weight;

  const initialForm = {
    name: freight.name ?? "",
    cargoType_id: freight.cargoType_id,
    origin_label: freight.origin_label,
    origin_lat: freight.origin_lat,
    origin_lng: freight.origin_lng,
    destination_label: freight.destination_label,
    destination_lat: freight.destination_lat,
    destination_lng: freight.destination_lng,
    originalValue: freight.originalValue,
    weight: freight.weight ?? undefined,
    daysLimit: freight.daysLimit ?? undefined,
    status_id: freight.status_id ?? undefined,
  };

  const routeSubtitle = `${freight.origin_label} → ${freight.destination_label} · ${formatFreightDistanceKm(Math.round(distKm), lang)}`;

  const featuredProposal = bestProposal;
  const proposalCount = proposals.length;
  const proposalsSorted = [...proposals].sort((a, b) => a.value - b.value);
  const bestAmount = featuredProposal?.value ?? displayValue;
  const savingsDisplay = Math.max(0, Math.round((displayValue - bestAmount) * 100) / 100);
  const assignedDriverProfile =
    freight.assignedDriver_id != null ? driverProfilesById[freight.assignedDriver_id] : undefined;

  async function onSubmitUpdate(body: FreightCargoStepBody) {
    if (!isValidMapPin(editOrigin) || !isValidMapPin(editDestination)) {
      toast.error(t("pages.freightWizard.pinRequired"));
      return;
    }

    const nextBody: FreightUpdateBody = {
      ...body,
      origin_label: editOrigin.label.trim(),
      origin_lat: editOrigin.lat,
      origin_lng: editOrigin.lng,
      destination_label: editDestination.label.trim(),
      destination_lat: editDestination.lat,
      destination_lng: editDestination.lng,
    };

    const ok = await handleUpdate(nextBody);
    if (ok) setEditing(false);
  }

  async function onConfirmDelete() {
    const ok = await handleDelete();
    if (ok) setDeleteOpen(false);
  }

  async function onConfirmCancel() {
    const ok = await handleCancelFreight();
    if (ok) setCancelOpen(false);
  }

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:p-4 md:p-6">
      <Button
        type="button"
        variant="ghost"
        className="bg-brand-green text-white hover:bg-brand-green-dark hover:text-white mb-3 h-auto min-h-10 w-fit justify-start gap-2 rounded-lg px-2 py-2 text-sm"
        onClick={() => navigate("/Freights")}
      >
        <ArrowLeft className="size-4 shrink-0 text-white" aria-hidden />
        {t("pages.freightDetail.backToList")}
      </Button>

      <header className="mb-4 flex flex-col gap-4 sm:mb-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2 gap-y-2">
            <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              {freight.name?.trim()
                ? freight.name.trim()
                : t("pages.freightDetail.title", { id: freight.id })}
            </h1>
            <Badge
              variant="outline"
              className={cn("rounded-full font-medium", statusBadgeClass(slug))}
            >
              {t(FREIGHT_STATUS_LABEL_KEY[slug])}
            </Badge>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">{routeSubtitle}</p>
          <p className="text-xs text-muted-foreground">
            {t("pages.freightDetail.createdAtLabel")}{" "}
            {formatDateTimeLabel(freight.createdAt ?? freight.updatedAt, lang)}
          </p>
        </div>

        {!editing ? (
          <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:max-w-none sm:flex-row sm:flex-wrap sm:justify-end">
            {slug === "entregue" ? (
              <Button
                type="button"
                className="min-h-11 w-full rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 sm:min-h-9 sm:w-auto"
                disabled={completing}
                onClick={() => void handleCompleteFreight()}
              >
                {t("pages.freightDetail.completeFreight")}
              </Button>
            ) : null}
            {slug !== "cancelado" && slug !== "concluido" ? (
              <Button
                type="button"
                variant="outline"
                className="min-h-11 w-full rounded-lg border-amber-500/60 text-amber-700 hover:bg-amber-50 hover:text-amber-800 sm:min-h-9 sm:w-auto dark:border-amber-500/40 dark:text-amber-300 dark:hover:bg-amber-500/10"
                disabled={cancelling}
                onClick={() => setCancelOpen(true)}
              >
                <Ban className="size-4 shrink-0" />
                {t("pages.freightDetail.cancelFreight")}
              </Button>
            ) : null}
            <Button
              type="button"
              className="min-h-11 w-full rounded-lg bg-brand-green text-white hover:bg-brand-green-dark sm:min-h-9 sm:w-auto"
              onClick={() => setEditing(true)}
            >
              {t("pages.freightDetail.edit")}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="min-h-11 w-full rounded-lg border-destructive/60 text-destructive hover:bg-destructive/10 sm:min-h-9 sm:w-auto"
              onClick={() => setDeleteOpen(true)}
            >
              {t("pages.freightDetail.delete")}
            </Button>
          </div>
        ) : null}
      </header>

      {!editing ? (
        <>
          <FreightStatusTimeline
            slug={slug}
            createdAt={freight.createdAt}
            updatedAt={freight.updatedAt}
            history={statusTimelineHistory}
            lang={lang}
          />

          <div className="mt-4 space-y-4 md:mt-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
              <section className={cn(cardShell, "p-4 sm:p-5")}>
                <h2 className="mb-5 text-base font-bold tracking-tight text-foreground">
                  {t("pages.freightDetail.sectionInfo")}
                </h2>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-7">
                  <DetailField icon={Tag} label={t("pages.freightDetail.fieldFreightName")}>
                    {freight.name?.trim() ? freight.name.trim() : "—"}
                  </DetailField>
                  <DetailField icon={Package} label={t("pages.freightDetail.fieldCargoType")}>
                    {freight.CargoType?.name ?? "—"}
                  </DetailField>
                  <DetailField icon={Scale} label={t("pages.freightDetail.fieldWeight")}>
                    {weightKg != null ? formatFreightWeightKg(weightKg, lang) : "—"}
                  </DetailField>
                  <DetailField
                    icon={MapPin}
                    label={t("pages.freights.columnDeparture")}
                    sub={`${freight.origin_lat}, ${freight.origin_lng}`}
                  >
                    {freight.origin_label}
                  </DetailField>
                  <DetailField
                    icon={MapPin}
                    label={t("pages.freights.columnDestination")}
                    sub={`${freight.destination_lat}, ${freight.destination_lng}`}
                  >
                    {freight.destination_label}
                  </DetailField>
                  <DetailField icon={Truck} label={t("pages.freightDetail.fieldDistance")}>
                    {formatFreightDistanceKm(Math.round(distKm), lang)}
                  </DetailField>
                  <DetailField icon={CalendarDays} label={t("pages.freightDetail.fieldPublishedAt")}>
                    {freight.createdAt ? formatDateTimeLabel(freight.createdAt, lang) : "—"}
                  </DetailField>
                  {freight.daysLimit != null ? (
                    <DetailField icon={CalendarDays} label={t("pages.freightForm.daysLimit")}>
                      {freight.daysLimit}
                    </DetailField>
                  ) : null}
                </div>

                {freight.assignedDriver_id != null ? (
                  <div className="mt-6 border-t border-border pt-6">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-7">
                      <DetailField
                        icon={User}
                        label={t("pages.freights.columnName")}
                        sub={t("pages.freightDetail.driverId", { id: freight.assignedDriver_id })}
                      >
                        {assignedDriverProfile?.name ??
                          t("pages.freightDetail.driverId", { id: freight.assignedDriver_id })}
                      </DetailField>
                      <DetailField icon={Truck} label={t("pages.freightDetail.proposalVehicleLabel")}>
                        {assignedDriverProfile?.vehicle ?? t("pages.freightDetail.vehicleUnavailable")}
                      </DetailField>
                    </div>
                  </div>
                ) : null}
              </section>

              <section className={cn(cardShell, "p-4 sm:p-5")}>
                <h2 className="mb-5 text-base font-bold tracking-tight text-foreground">
                  {t("pages.freightDetail.sectionValues")}
                </h2>
                <div className="rounded-xl bg-muted/70 px-4 py-4 dark:bg-muted/40">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {t("pages.freightDetail.estimatedValueLabel")}
                  </p>
                  <p className="mt-1 text-2xl font-bold tabular-nums text-brand-green-dark dark:text-brand-green-light sm:text-3xl">
                    {formatFreightCurrencyAmount(displayValue, lang)}
                  </p>
                  {freight.finalValue != null ? (
                    <p className="mt-2 text-xs text-muted-foreground">
                      {t("pages.freightDetail.originalValue")}:{" "}
                      {formatFreightCurrencyAmount(freight.originalValue, lang)}
                    </p>
                  ) : null}
                </div>

                <div className="mt-5 space-y-3">
                  <ValueSummaryRow label={t("pages.freightDetail.proposalsReceived")} value={proposalCount} />
                </div>

                <div className="my-4 h-px bg-border" />

                <div className="space-y-3">

                <ValueSummaryRow
                    label={t("pages.freightDetail.bestProposal")}
                    value={formatFreightCurrencyAmount(bestAmount, lang)}
                    valueClassName="text-brand-green-dark dark:text-brand-green-light"
                  />
                  <ValueSummaryRow
                    label={t("pages.freightDetail.potentialSavings")}
                    value={formatFreightCurrencyAmount(savingsDisplay, lang)}
                    valueClassName="text-brand-green-dark dark:text-brand-green-light"
                  />
                </div>
              </section>
            </div>

            <section className={cn(cardShell, "p-4 sm:p-5")}>
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-base font-bold tracking-tight text-foreground">
                  {t("pages.freightDetail.proposalsSectionTitle", { count: proposalCount })}
                </h2>
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 w-full shrink-0 gap-1.5 rounded-lg border-border sm:w-auto"
                  onClick={() => navigate("/Proposals")}
                >
                  {t("pages.freightDetail.viewAllProposals")}
                  <ArrowRight className="size-4" aria-hidden />
                </Button>
              </div>

              {featuredProposal ? (
                <div className="space-y-3">
                  {proposalsSorted.map((proposal, index) => {
                    const isBest = index === 0;
                    const canActOnProposal =
                      (proposal.ProposalStatusType?.name ?? "").toLowerCase() === "enviada";
                    const proposalDriverName =
                      driverProfilesById[proposal.driver_id]?.name ??
                      t("pages.freightDetail.driverId", { id: proposal.driver_id });
                    const proposalVehicle =
                      driverProfilesById[proposal.driver_id]?.vehicle ??
                      t("pages.freightDetail.vehicleUnavailable");

                    return (
                      <div
                        key={proposal.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => void navigate(`/Proposals/${proposal.id}`)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            void navigate(`/Proposals/${proposal.id}`);
                          }
                        }}
                        className="relative cursor-pointer rounded-xl border-2 border-brand-green/45 bg-card p-4 shadow-sm transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/40 sm:p-5"
                      >
                        {isBest ? (
                          <span className="absolute right-3 top-3 rounded-full bg-brand-green/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-brand-green-dark dark:text-brand-green-light">
                            {t("pages.freightDetail.bestProposalBadge")}
                          </span>
                        ) : null}

                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                          <div
                            className="flex size-12 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-bold text-muted-foreground"
                            aria-hidden
                          >
                            {initialsFromName(proposalDriverName)}
                          </div>
                          <div className="min-w-0 flex-1 space-y-1 pr-2 sm:pr-24">
                            <p className="text-base font-bold text-foreground">{proposalDriverName}</p>
                            <p className="text-sm text-muted-foreground">{proposalVehicle}</p>
                          </div>
                        </div>

                        <div className="mt-5 grid grid-cols-1 gap-4 border-t border-border pt-5 sm:grid-cols-2">
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                              {t("pages.freightDetail.proposalValueLabel")}
                            </p>
                            <p className="mt-1 text-lg font-bold tabular-nums text-foreground">
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
                          <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
                            <Button
                              type="button"
                              variant="outline"
                              className="min-h-11 w-full gap-2 rounded-lg border-destructive/70 text-destructive hover:bg-destructive/10 sm:min-h-10 sm:w-auto"
                              disabled={proposalActionId === proposal.id}
                              onClick={(event) => {
                                event.stopPropagation();
                                void handleRejectProposal(proposal.id);
                              }}
                            >
                              <X className="size-4 shrink-0" aria-hidden />
                              {t("pages.freightDetail.rejectProposal")}
                            </Button>
                            <Button
                              type="button"
                              className="min-h-11 w-full gap-2 rounded-lg bg-brand-green text-white hover:bg-brand-green-dark sm:min-h-10 sm:w-auto"
                              disabled={proposalActionId === proposal.id}
                              onClick={(event) => {
                                event.stopPropagation();
                                void handleAcceptProposal(proposal.id);
                              }}
                            >
                              <Check className="size-4 shrink-0" aria-hidden />
                              {t("pages.freightDetail.acceptProposal")}
                            </Button>
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-8 text-center">
                  <p className="text-sm font-medium text-muted-foreground">
                    {t("pages.freightDetail.noProposalsYet")}
                  </p>
                </div>
              )}
            </section>
          </div>
        </>
      ) : (
        <div className={cn(cardShell, "p-4 sm:p-5")}>
          <h2 className="mb-4 text-sm font-semibold text-foreground">
            {t("pages.freightDetail.editSectionTitle")}
          </h2>

          <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-2">
            <section className="rounded-xl border border-border/80 bg-muted/25 p-3 sm:p-4">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t("pages.freightWizard.stepOrigin")}
              </h3>
              <AddressMapPicker
                accessToken={MAPBOX_PK}
                value={editOrigin}
                onChange={setEditOrigin}
              />
            </section>

            <section className="rounded-xl border border-border/80 bg-muted/25 p-3 sm:p-4">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t("pages.freightWizard.stepDestination")}
              </h3>
              <AddressMapPicker
                accessToken={MAPBOX_PK}
                value={editDestination}
                onChange={setEditDestination}
              />
            </section>
          </div>

          <FreightForm
            key={freight.id}
            cargoTypes={cargoTypes}
            statusTypes={statusTypes}
            cargoFieldsOnly
            showStatus
            initial={initialForm}
            onSubmit={onSubmitUpdate}
            submitLabel={t("pages.freightForm.save")}
            isSubmitting={saving}
            secondaryAction={{
              label: t("pages.freightDetail.cancelEdit"),
              onClick: () => setEditing(false),
              disabled: saving,
            }}
          />
        </div>
      )}

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent showCloseButton={!deleting}>
          <DialogHeader>
            <DialogTitle>{t("pages.freightDetail.deleteConfirmTitle")}</DialogTitle>
            <DialogDescription>{t("pages.freightDetail.deleteConfirmBody")}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="rounded-lg"
              disabled={deleting}
              onClick={() => setDeleteOpen(false)}
            >
              {t("pages.freightDetail.cancel")}
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="rounded-lg"
              disabled={deleting}
              onClick={() => void onConfirmDelete()}
            >
              {t("pages.freightDetail.confirmDelete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent showCloseButton={!cancelling}>
          <DialogHeader>
            <DialogTitle>{t("pages.freightDetail.cancelConfirmTitle")}</DialogTitle>
            <DialogDescription>{t("pages.freightDetail.cancelConfirmBody")}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="rounded-lg"
              disabled={cancelling}
              onClick={() => setCancelOpen(false)}
            >
              {t("pages.freightDetail.cancel")}
            </Button>
            <Button
              type="button"
              className="rounded-lg bg-amber-600 text-white hover:bg-amber-700"
              disabled={cancelling}
              onClick={() => void onConfirmCancel()}
            >
              {t("pages.freightDetail.confirmCancel")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FreightDetailPage;
