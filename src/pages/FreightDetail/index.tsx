import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import { FreightForm } from "@/components/ui/freightForm";
import {
  FREIGHT_STATUS_LABEL_KEY,
  parseStatusSlug,
  statusBadgeClass,
} from "@/components/ui/freightStatusUi";
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
import { cn } from "@/lib/utils";
import http from "@/service/http";
import type {
  CargoTypeDto,
  FreightDto,
  FreightStatusTypeDto,
  FreightUpdateBody,
} from "@/types/freight";
import { haversineKm } from "@/utils/haversineKm";
import { trataErroAxios } from "@/utils/trataErroAxios";

function formatCurrency(value: number, locale: AppLanguage): string {
  const tag = locale === "en" ? "en-US" : "pt-BR";
  const currency = locale === "en" ? "USD" : "BRL";
  return new Intl.NumberFormat(tag, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDate(iso: string | undefined, locale: AppLanguage): string {
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

const FreightDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const lang = i18n.language as AppLanguage;
  const navigate = useNavigate();

  const [freight, setFreight] = useState<FreightDto | null>(null);
  const [cargoTypes, setCargoTypes] = useState<CargoTypeDto[]>([]);
  const [statusTypes, setStatusTypes] = useState<FreightStatusTypeDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const loadAll = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const [freightRes, cargoRes, statusRes] = await Promise.all([
        http.get<FreightDto>(`/freight/${id}`),
        http.get<CargoTypeDto[]>("/cargo-type"),
        http.get<FreightStatusTypeDto[]>("/freight-status-type"),
      ]);
      setFreight(freightRes.data);
      setCargoTypes(Array.isArray(cargoRes.data) ? cargoRes.data : []);
      setStatusTypes(Array.isArray(statusRes.data) ? statusRes.data : []);
    } catch (e) {
      toast.error(trataErroAxios(e));
      setFreight(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  async function handleUpdate(body: FreightUpdateBody) {
    if (!id) return;
    try {
      setSaving(true);
      const { data } = await http.put<{ message?: string; freight: FreightDto }>(
        `/freight/${id}`,
        body
      );
      toast.success(data.message ?? t("pages.freightDetail.savedOk"));
      setFreight(data.freight);
      setEditing(false);
    } catch (e) {
      toast.error(trataErroAxios(e));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!id) return;
    try {
      setDeleting(true);
      const { data } = await http.delete<{ message?: string }>(`/freight/${id}`);
      toast.success(data.message ?? t("pages.freightDetail.deletedOk"));
      setDeleteOpen(false);
      navigate("/Freights", { replace: true });
    } catch (e) {
      toast.error(trataErroAxios(e));
    } finally {
      setDeleting(false);
    }
  }

  if (!id) {
    return null;
  }

  if (loading && !freight) {
    return (
      <div className="flex min-h-0 min-w-0 flex-1 flex-col p-3 sm:p-4 md:p-6">
        <p className="text-sm text-muted-foreground">{t("pages.freightDetail.loading")}</p>
      </div>
    );
  }

  if (!freight) {
    return (
      <div className="flex min-h-0 min-w-0 flex-1 flex-col p-3 sm:p-4 md:p-6">
        <Button variant="outline" className="w-fit rounded-lg" onClick={() => navigate("/Freights")}>
          {t("pages.freightDetail.back")}
        </Button>
        <p className="mt-4 text-sm text-muted-foreground">{t("pages.freightDetail.notFound")}</p>
      </div>
    );
  }

  const slug = parseStatusSlug(freight.FreightStatusType?.name);
  const distKm = haversineKm(
    freight.origin_lat,
    freight.origin_lng,
    freight.destination_lat,
    freight.destination_lng
  );
  const displayValue = freight.finalValue ?? freight.originalValue;
  const weightKg = freight.weight;

  const initialForm = {
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

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col p-3 sm:p-4 md:p-6">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          className="rounded-lg"
          onClick={() => navigate("/Freights")}
        >
          {t("pages.freightDetail.back")}
        </Button>
        {!editing ? (
          <>
            <Button
              type="button"
              className="rounded-lg bg-brand-green text-white hover:bg-brand-green-dark"
              onClick={() => setEditing(true)}
            >
              {t("pages.freightDetail.edit")}
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="rounded-lg"
              onClick={() => setDeleteOpen(true)}
            >
              {t("pages.freightDetail.delete")}
            </Button>
          </>
        ) : null}
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm">
        <div className="border-b border-border p-4 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                {t("pages.freightDetail.title", { id: freight.id })}
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                {t("pages.freightDetail.updatedAt")}{" "}
                {formatDate(freight.updatedAt ?? freight.createdAt, lang)}
              </p>
            </div>
            <Badge
              variant="outline"
              className={cn("rounded-full font-medium", statusBadgeClass(slug))}
            >
              {t(FREIGHT_STATUS_LABEL_KEY[slug])}
            </Badge>
          </div>
        </div>

        {!editing ? (
          <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-6">
            <div>
              <p className="text-xs font-medium text-muted-foreground">{t("pages.freights.columnCargo")}</p>
              <p className="font-semibold text-foreground">{freight.CargoType?.name ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">{t("pages.freights.columnName")}</p>
              <p className="text-foreground">
                {freight.assignedDriver_id != null
                  ? t("pages.freightDetail.driverId", { id: freight.assignedDriver_id })
                  : "—"}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">{t("pages.freights.columnDeparture")}</p>
              <p className="font-medium text-foreground">{freight.origin_label}</p>
              <p className="text-xs text-muted-foreground tabular-nums">
                {freight.origin_lat}, {freight.origin_lng}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">{t("pages.freights.columnDestination")}</p>
              <p className="font-medium text-foreground">{freight.destination_label}</p>
              <p className="text-xs text-muted-foreground tabular-nums">
                {freight.destination_lat}, {freight.destination_lng}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">{t("pages.freights.columnValue")}</p>
              <p className="font-semibold tabular-nums text-foreground">
                {formatCurrency(displayValue, lang)}
              </p>
              {freight.finalValue != null ? (
                <p className="text-xs text-muted-foreground">
                  {t("pages.freightDetail.originalValue")}:{" "}
                  {formatCurrency(freight.originalValue, lang)}
                </p>
              ) : null}
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">{t("pages.freights.columnWeight")}</p>
              <p className="text-sm text-muted-foreground">
                {weightKg != null ? `${weightKg} kg` : "—"}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">{t("pages.freights.columnDistance")}</p>
              <p className="text-sm text-muted-foreground tabular-nums">
                {Math.round(distKm)} km
              </p>
            </div>
            {freight.daysLimit != null ? (
              <div>
                <p className="text-xs font-medium text-muted-foreground">{t("pages.freightForm.daysLimit")}</p>
                <p className="text-sm text-foreground">{freight.daysLimit}</p>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="p-4 sm:p-6">
            <div className="mb-4 flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="rounded-lg"
                onClick={() => setEditing(false)}
                disabled={saving}
              >
                {t("pages.freightDetail.cancelEdit")}
              </Button>
            </div>
            <FreightForm
              key={freight.id}
              cargoTypes={cargoTypes}
              statusTypes={statusTypes}
              showStatus
              initial={initialForm}
              onSubmit={handleUpdate}
              submitLabel={t("pages.freightForm.save")}
              isSubmitting={saving}
            />
          </div>
        )}
      </div>

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
              onClick={() => void handleDelete()}
            >
              {t("pages.freightDetail.confirmDelete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FreightDetailPage;
