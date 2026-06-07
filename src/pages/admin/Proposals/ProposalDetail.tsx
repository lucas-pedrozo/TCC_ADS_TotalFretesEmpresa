import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  MapPin,
  Package,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { AdminConfirmDeleteDialog } from "@/components/admin/AdminConfirmDeleteDialog";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { RejectProposalDialog } from "@/components/proposals/RejectProposalDialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FREIGHT_STATUS_LABEL_KEY,
  resolveFreightStatusSlug,
  statusBadgeClass,
} from "@/components/ui/freightStatusUi";
import { normalizeLanguage } from "@/i18n";
import { cn } from "@/lib/utils";
import { selectableItemHoverClassName } from "@/utils/ui";
import { formatDateTimeLabel } from "@/utils/dateFormat";
import {
  formatFreightCurrencyAmount,
  formatFreightDistanceKm,
} from "@/utils/freightFormat";
import { haversineKm } from "@/utils/haversineKm";
import { initialsFromName } from "@/utils/person";
import http from "@/service/http";
import type { ProposalDto } from "@/types/proposal";
import {
  resolveDriverDisplayName,
  resolveDriverProfilesFromProposals,
  type DriverProfile,
} from "@/utils/driverProfiles";
import {
  getFreightFromProposal,
  isAcceptedProposalStatus,
  isPendingProposalStatus,
  isRejectedProposalStatus,
  proposalStatusBadgeClass,
} from "@/utils/proposal";
import { trataErroAxios, traduzMensagemApi } from "@/utils/trataErroAxios";

const cardShell = "rounded-xl border border-border bg-card shadow-sm";

const AdminProposalDetailPage = () => {
  const { proposalId } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const lang = normalizeLanguage(i18n.language);

  const [proposal, setProposal] = useState<ProposalDto | null>(null);
  const [driverProfiles, setDriverProfiles] = useState<Record<number, DriverProfile>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);

  const load = useCallback(async () => {
    if (!proposalId) return;
    setIsLoading(true);
    try {
      const { data } = await http.get<ProposalDto>(`/proposal/${proposalId}`);
      setProposal(data);
      const profiles = await resolveDriverProfilesFromProposals([data]);
      setDriverProfiles(profiles);
    } catch (error) {
      toast.error(trataErroAxios(error));
      setProposal(null);
    } finally {
      setIsLoading(false);
    }
  }, [proposalId]);

  useEffect(() => {
    void load();
  }, [load]);

  const freight = useMemo(
    () => (proposal ? getFreightFromProposal(proposal) : null),
    [proposal]
  );

  const canActOnProposal = useMemo(() => {
    if (!proposal) return false;
    return isPendingProposalStatus(proposal.ProposalStatusType?.name);
  }, [proposal]);

  const handleAccept = async () => {
    if (!proposalId) return;
    setIsSaving(true);
    const toastId = toast.loading(t("pages.admin.common.saving"));
    try {
      const { data } = await http.patch(`/proposal/${proposalId}/accept`, {});
      toast.success(traduzMensagemApi(data.message) ?? t("pages.admin.common.saved"), {
        id: toastId,
      });
      await load();
    } catch (error) {
      toast.error(trataErroAxios(error), { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReject = async (comment: string) => {
    if (!proposalId) return;
    setIsSaving(true);
    const toastId = toast.loading(t("pages.admin.common.saving"));
    const trimmed = comment.trim();
    const body = trimmed.length > 0 ? { rejection_comment: trimmed } : {};
    try {
      const { data } = await http.patch(`/proposal/${proposalId}/reject`, body);
      toast.success(traduzMensagemApi(data.message) ?? t("pages.admin.common.saved"), {
        id: toastId,
      });
      setRejectOpen(false);
      await load();
    } catch (error) {
      toast.error(trataErroAxios(error), { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!proposalId) return;
    setIsSaving(true);
    const toastId = toast.loading(t("pages.admin.common.deleting"));
    try {
      const { data } = await http.delete(`/proposal/${proposalId}`);
      toast.success(traduzMensagemApi(data.message) ?? t("pages.admin.common.deleted"), {
        id: toastId,
      });
      navigate("/admin/proposals");
    } catch (error) {
      toast.error(trataErroAxios(error), { id: toastId });
    } finally {
      setIsSaving(false);
      setDeleteOpen(false);
    }
  };

  if (isLoading) {
    return (
      <AdminPageShell title={t("pages.admin.proposals.detailTitle")}>
        <div className="flex max-w-3xl flex-col gap-4">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-[280px] rounded-xl" />
          <Skeleton className="h-[220px] rounded-xl" />
        </div>
      </AdminPageShell>
    );
  }

  if (!proposal) {
    return (
      <AdminPageShell title={t("pages.admin.proposals.detailTitle")}>
        <div className="flex flex-col items-start gap-4">
          <p className="text-sm text-muted-foreground">{t("pages.admin.common.notFound")}</p>
          <Button variant="outline" render={<Link to="/admin/proposals" />}>
            <ArrowLeft className="mr-2 size-4" />
            {t("pages.admin.common.back")}
          </Button>
        </div>
      </AdminPageShell>
    );
  }

  const statusName = proposal.ProposalStatusType?.name ?? "";
  const isPending = isPendingProposalStatus(statusName);
  const isAccepted = isAcceptedProposalStatus(statusName);
  const isRejected = isRejectedProposalStatus(statusName);
  const driverLabel = resolveDriverDisplayName(proposal, driverProfiles);
  const driverProfile = driverProfiles[proposal.driver_id];
  const driverImageUrl =
    driverProfile?.imageUrl?.trim() ||
    proposal.Driver?.UserImage?.url?.trim() ||
    null;
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
    <AdminPageShell title={t("pages.admin.proposals.detailTitle")}>
      <div className="flex max-w-3xl flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" size="sm" className="rounded-lg" render={<Link to="/admin/proposals" />}>
            <ArrowLeft className="mr-2 size-4" />
            {t("pages.admin.common.back")}
          </Button>
          <h1 className="text-lg font-bold text-foreground sm:text-xl">
            {t("pages.proposalDetail.title", { id: proposal.id })}
          </h1>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="ml-auto rounded-lg border-destructive/70 text-destructive hover:bg-destructive/10"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="mr-2 size-4" />
            {t("pages.admin.common.delete")}
          </Button>
        </div>

        <section className={cn(cardShell, "p-4 sm:p-5")}>
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <Avatar className="size-12">
                {driverImageUrl ? <AvatarImage src={driverImageUrl} alt={driverLabel} /> : null}
                <AvatarFallback className="bg-muted text-sm font-bold text-muted-foreground">
                  {initialsFromName(driverLabel)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-base font-bold text-foreground">{driverLabel}</p>
                <p className="text-sm text-muted-foreground">{vehicleLabel}</p>
              </div>
            </div>
            <Badge
              variant="outline"
              className={cn("rounded-full font-medium", proposalStatusBadgeClass(statusName))}
            >
              {isPending
                ? t("pages.proposals.statusPending")
                : isAccepted
                  ? t("pages.proposals.statusAccepted")
                  : isRejected
                    ? t("pages.proposals.statusRejected")
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
                <CalendarDays className="size-4 text-muted-foreground" />
                {formatDateTimeLabel(proposal.createdAt, lang)}
              </p>
            </div>
          </div>

          {proposal.rejection_comment ? (
            <div className="mt-4 rounded-lg border border-destructive/20 bg-destructive/5 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-destructive">
                {t("pages.admin.proposals.message")}
              </p>
              <p className="mt-1 text-sm text-foreground">{proposal.rejection_comment}</p>
            </div>
          ) : null}

          {canActOnProposal ? (
            <div className="mt-5 flex flex-col gap-2 border-t border-border pt-5 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                className="min-h-11 w-full gap-2 rounded-lg border-destructive/70 text-destructive hover:bg-destructive/10 sm:min-h-10 sm:w-auto"
                disabled={isSaving}
                onClick={() => setRejectOpen(true)}
              >
                <X className="size-4 shrink-0" />
                {t("pages.admin.proposals.reject")}
              </Button>
              <Button
                type="button"
                className="min-h-11 w-full gap-2 rounded-lg bg-brand-green text-white hover:bg-brand-green-dark sm:min-h-10 sm:w-auto"
                disabled={isSaving}
                onClick={() => void handleAccept()}
              >
                <Check className="size-4 shrink-0" />
                {t("pages.admin.proposals.accept")}
              </Button>
            </div>
          ) : null}
        </section>

        {freight ? (
          <section
            role="button"
            tabIndex={0}
            onClick={() => navigate(`/admin/freights/${freight.id}`)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                navigate(`/admin/freights/${freight.id}`);
              }
            }}
            className={cn(
              cardShell,
              "cursor-pointer p-4 transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/40 sm:p-5",
              selectableItemHoverClassName
            )}
          >
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-foreground">
                {t("pages.proposalDetail.linkedFreight")}
              </h2>
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-brand-green-dark dark:text-brand-green-light">
                {t("pages.proposalDetail.openFreight")}
                <ArrowRight className="size-4" />
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
                <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <span className="min-w-0 break-words">{freight.origin_label}</span>
              </p>
              <p className="flex items-start gap-2 text-muted-foreground">
                <span className="w-4 shrink-0 text-center">→</span>
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
                <Package className="mt-0.5 size-4 text-muted-foreground" />
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {t("pages.proposalDetail.cargoType")}
                  </p>
                  <p className="text-sm font-medium text-foreground">{cargoName}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Tag className="mt-0.5 size-4 text-muted-foreground" />
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
        ) : (
          <section className={cn(cardShell, "p-4 sm:p-5")}>
            <p className="text-sm text-muted-foreground">
              {t("pages.admin.proposals.freight")}:{" "}
              <Link
                to={`/admin/freights/${proposal.freight_id}`}
                className="font-medium text-brand-green underline-offset-2 hover:underline"
              >
                #{proposal.freight_id}
              </Link>
            </p>
          </section>
        )}
      </div>

      <RejectProposalDialog
        open={rejectOpen}
        onOpenChange={setRejectOpen}
        loading={isSaving}
        onConfirm={handleReject}
      />

      <AdminConfirmDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={t("pages.admin.common.confirmDeleteTitle")}
        description={t("pages.admin.proposals.deleteConfirm", { id: proposal.id })}
        onConfirm={handleDelete}
        isLoading={isSaving}
      />
    </AdminPageShell>
  );
};

export default AdminProposalDetailPage;
