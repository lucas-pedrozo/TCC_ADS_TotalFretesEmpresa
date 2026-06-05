import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, CheckCircle2, Pencil, Trash2, XCircle } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { adminNativeSelectClass } from "@/components/admin/adminNativeSelect";
import { AdminFreightProposalsPanel } from "@/components/admin/AdminFreightProposalsPanel";
import { AdminFreightStatusBadge } from "@/components/admin/AdminFreightStatusBadge";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { AdminConfirmDeleteDialog } from "@/components/admin/AdminConfirmDeleteDialog";
import type { MapPinValue } from "@/components/maps/AddressMapPicker";
import { AddressMapPicker } from "@/components/maps/AddressMapPicker";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { resolveFreightStatusSlug } from "@/components/ui/freightStatusUi";
import { cn } from "@/lib/utils";
import http from "@/service/http";
import type { CargoTypeDto, FreightDto, FreightStatusTypeDto } from "@/types/freight";
import { isValidMapPin } from "@/utils/freightCreate";
import { trataErroAxios, traduzMensagemApi } from "@/utils/trataErroAxios";

const MAPBOX_PK = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN?.trim() ?? "";

const AdminFreightDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [freight, setFreight] = useState<FreightDto | null>(null);
  const [cargoTypes, setCargoTypes] = useState<CargoTypeDto[]>([]);
  const [statusTypes, setStatusTypes] = useState<FreightStatusTypeDto[]>([]);
  const [form, setForm] = useState({
    name: "",
    cargoType_id: "",
    status_id: "",
    originalValue: "",
    weight: "",
    daysLimit: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [editOrigin, setEditOrigin] = useState<MapPinValue | null>(null);
  const [editDestination, setEditDestination] = useState<MapPinValue | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const [freightRes, cargoRes, statusRes] = await Promise.all([
        http.get<FreightDto>(`/freight/${id}`),
        http.get<CargoTypeDto[]>("/cargo-type"),
        http.get<FreightStatusTypeDto[]>("/freight-status-type"),
      ]);
      setFreight(freightRes.data);
      setCargoTypes(Array.isArray(cargoRes.data) ? cargoRes.data : []);
      setStatusTypes(Array.isArray(statusRes.data) ? statusRes.data : []);
      const f = freightRes.data;
      setForm({
        name: f.name ?? "",
        cargoType_id: String(f.cargoType_id ?? ""),
        status_id: String(f.status_id ?? ""),
        originalValue: String(f.originalValue ?? ""),
        weight: String(f.weight ?? ""),
        daysLimit: f.daysLimit ? String(f.daysLimit) : "",
      });
    } catch (error) {
      toast.error(trataErroAxios(error));
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

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

  const statusSlug = useMemo(
    () =>
      freight
        ? resolveFreightStatusSlug({
            statusId: freight.status_id,
            statusName: freight.FreightStatusType?.name ?? freight.status?.name,
          })
        : "concluido",
    [freight]
  );

  const resetFormFromFreight = useCallback(() => {
    if (!freight) return;
    setForm({
      name: freight.name ?? "",
      cargoType_id: String(freight.cargoType_id ?? ""),
      status_id: String(freight.status_id ?? ""),
      originalValue: String(freight.originalValue ?? ""),
      weight: String(freight.weight ?? ""),
      daysLimit: freight.daysLimit ? String(freight.daysLimit) : "",
    });
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
  }, [freight]);

  const handleSave = async () => {
    if (!id) return;
    if (!isValidMapPin(editOrigin) || !isValidMapPin(editDestination)) {
      toast.error(t("pages.freightWizard.pinRequired"));
      return;
    }
    setIsSaving(true);
    const toastId = toast.loading(t("pages.admin.common.saving"));
    try {
      const { data } = await http.put(`/freight/${id}`, {
        name: form.name.trim(),
        cargoType_id: Number(form.cargoType_id),
        status_id: Number(form.status_id),
        originalValue: Number(form.originalValue),
        weight: Number(form.weight),
        origin_label: editOrigin.label.trim(),
        origin_lat: editOrigin.lat,
        origin_lng: editOrigin.lng,
        destination_label: editDestination.label.trim(),
        destination_lat: editDestination.lat,
        destination_lng: editDestination.lng,
        ...(form.daysLimit ? { daysLimit: Number(form.daysLimit) } : {}),
      });
      toast.success(traduzMensagemApi(data.message) ?? t("pages.admin.common.saved"), {
        id: toastId,
      });
      setEditing(false);
      await load();
    } catch (error) {
      toast.error(trataErroAxios(error), { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAction = async (action: "cancel" | "complete" | "delete") => {
    if (!id) return;
    setIsSaving(true);
    const toastId = toast.loading(t("pages.admin.common.saving"));
    try {
      let data: { message?: string };
      if (action === "delete") {
        ({ data } = await http.delete(`/freight/${id}`));
        toast.success(traduzMensagemApi(data.message) ?? t("pages.admin.common.deleted"), {
          id: toastId,
        });
        navigate("/admin/freights");
        return;
      }
      if (action === "cancel") {
        ({ data } = await http.patch(`/freight/${id}/cancel`));
      } else {
        ({ data } = await http.patch(`/freight/${id}/complete`));
      }
      toast.success(traduzMensagemApi(data.message) ?? t("pages.admin.common.saved"), {
        id: toastId,
      });
      await load();
    } catch (error) {
      toast.error(trataErroAxios(error), { id: toastId });
    } finally {
      setIsSaving(false);
      setDeleteOpen(false);
      setCancelOpen(false);
    }
  };

  if (isLoading) {
    return (
      <AdminPageShell title={t("pages.admin.freights.detailTitle")}>
        <Skeleton className="h-40 w-full max-w-xl" />
      </AdminPageShell>
    );
  }

  if (!freight) {
    return (
      <AdminPageShell title={t("pages.admin.freights.detailTitle")}>
        <p className="text-sm text-muted-foreground">{t("pages.admin.common.notFound")}</p>
      </AdminPageShell>
    );
  }

  const title = freight.name?.trim() || `#${freight.id}`;

  return (
    <AdminPageShell title={t("pages.admin.freights.detailTitle")}>
      <Button
        type="button"
        variant="ghost"
        className="mb-4 h-auto min-h-10 w-fit gap-2 rounded-lg bg-brand-green px-3 py-2 text-sm text-white hover:bg-brand-green-dark hover:text-white"
        onClick={() => navigate("/admin/freights")}
      >
        <ArrowLeft className="size-4 shrink-0" aria-hidden />
        {t("pages.admin.common.back")}
      </Button>

      <header className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
            <AdminFreightStatusBadge freight={freight} />
          </div>
          <p className="text-sm text-muted-foreground">
            {freight.origin_label} → {freight.destination_label}
          </p>
        </div>

        {!editing ? (
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:justify-end">
            <Button
              type="button"
              className={cn(
                "min-h-10 gap-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60",
                statusSlug !== "entregue" && "cursor-not-allowed"
              )}
              disabled={isSaving || statusSlug !== "entregue"}
              title={
                statusSlug !== "entregue"
                  ? t("pages.freightDetail.completeFreightDisabledHint")
                  : undefined
              }
              onClick={() => void handleAction("complete")}
            >
              <CheckCircle2 className="size-4" />
              {t("pages.admin.freights.complete")}
            </Button>
            <Button
              type="button"
              className="min-h-10 gap-2 rounded-lg bg-brand-green text-white hover:bg-brand-green-dark"
              onClick={() => setEditing(true)}
            >
              <Pencil className="size-4" />
              {t("pages.freightDetail.edit")}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="min-h-10 gap-2 rounded-lg border-destructive/60 text-destructive hover:bg-destructive/10"
              disabled={isSaving || statusSlug === "cancelado"}
              onClick={() => setCancelOpen(true)}
            >
              <XCircle className="size-4" />
              {t("pages.admin.freights.cancel")}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="min-h-10 gap-2 rounded-lg border-destructive/60 text-destructive hover:bg-destructive/10"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className="size-4" />
              {t("pages.admin.common.delete")}
            </Button>
          </div>
        ) : (
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <Button
              type="button"
              variant="outline"
              disabled={isSaving}
              onClick={() => {
                resetFormFromFreight();
                setEditing(false);
              }}
            >
              {t("pages.freightDetail.cancelEdit")}
            </Button>
            <Button
              type="button"
              className="min-h-10 gap-2 rounded-lg bg-brand-green text-white hover:bg-brand-green-dark"
              disabled={isSaving}
              onClick={() => void handleSave()}
            >
              {t("pages.admin.common.save")}
            </Button>
          </div>
        )}
      </header>

      <div className="grid max-w-4xl gap-4">
        {!editing ? (
          <div className="rounded-lg border bg-muted/30 p-4 text-sm">
            <p>
              <strong>{t("pages.admin.freights.origin")}:</strong> {freight.origin_label}
            </p>
            <p>
              <strong>{t("pages.admin.freights.destination")}:</strong>{" "}
              {freight.destination_label}
            </p>
            <p>
              <strong>{t("pages.admin.freights.company")}:</strong>{" "}
              {freight.Company?.name ?? `#${freight.company_id}`}
            </p>
          </div>
        ) : null}


        {editing ? (
          <>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <section className="space-y-2 rounded-xl border border-border/80 bg-muted/25 p-3 sm:p-4">
                <Label>{t("pages.admin.freights.origin")}</Label>
                <AddressMapPicker
                  accessToken={MAPBOX_PK}
                  value={editOrigin}
                  onChange={setEditOrigin}
                />
              </section>
              <section className="space-y-2 rounded-xl border border-border/80 bg-muted/25 p-3 sm:p-4">
                <Label>{t("pages.admin.freights.destination")}</Label>
                <AddressMapPicker
                  accessToken={MAPBOX_PK}
                  value={editDestination}
                  onChange={setEditDestination}
                />
              </section>
            </div>

            <div className="space-y-2">
              <Label htmlFor="freight-name">{t("pages.admin.common.name")}</Label>
              <Input
                id="freight-name"
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="freight-cargo-type">{t("pages.admin.freights.cargoType")}</Label>
                <select
                  id="freight-cargo-type"
                  value={form.cargoType_id}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, cargoType_id: event.target.value }))
                  }
                  className={adminNativeSelectClass}
                >
                  <option value="">{t("pages.admin.freights.selectCargoType")}</option>
                  {cargoTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="freight-status">{t("pages.admin.freights.status")}</Label>
                <select
                  id="freight-status"
                  value={form.status_id}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, status_id: event.target.value }))
                  }
                  className={adminNativeSelectClass}
                >
                  <option value="">{t("pages.admin.freights.selectStatus")}</option>
                  {statusTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="freight-value">{t("pages.admin.freights.value")}</Label>
                <Input
                  id="freight-value"
                  type="number"
                  value={form.originalValue}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, originalValue: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="freight-weight">{t("pages.admin.freights.weight")}</Label>
                <Input
                  id="freight-weight"
                  type="number"
                  value={form.weight}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, weight: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="freight-days">{t("pages.admin.freights.daysLimit")}</Label>
                <Input
                  id="freight-days"
                  type="number"
                  value={form.daysLimit}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, daysLimit: event.target.value }))
                  }
                />
              </div>
            </div>
          </>
        ) : (
          <div className="grid gap-2 rounded-lg border p-4 text-sm sm:grid-cols-2">
            <p>
              <strong>{t("pages.admin.freights.company")}:</strong>{" "}
              {freight.Company?.name ?? `#${freight.company_id}`}
            </p>
            <p>
              <strong>{t("pages.admin.freights.cargoType")}:</strong>{" "}
              {freight.CargoType?.name ?? freight.cargo?.name ?? "—"}
            </p>
            <p>
              <strong>{t("pages.admin.freights.value")}:</strong> {freight.originalValue ?? "—"}
            </p>
            <p>
              <strong>{t("pages.admin.freights.weight")}:</strong> {freight.weight ?? "—"}
            </p>
            <p>
              <strong>{t("pages.admin.freights.daysLimit")}:</strong> {freight.daysLimit ?? "—"}
            </p>
          </div>
        )}
      </div>
      
      {!editing && freight.id ? (
          <AdminFreightProposalsPanel freightId={freight.id} pageSize={5} />
        ) : null}

      <AdminConfirmDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={t("pages.admin.common.confirmDeleteTitle")}
        description={t("pages.admin.freights.deleteConfirm", {
          name: freight.name ?? freight.id,
        })}
        onConfirm={() => handleAction("delete")}
        isLoading={isSaving}
      />

      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent showCloseButton={!isSaving}>
          <DialogHeader>
            <DialogTitle>{t("pages.freightDetail.cancelConfirmTitle")}</DialogTitle>
            <DialogDescription>{t("pages.freightDetail.cancelConfirmBody")}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={isSaving}
              onClick={() => setCancelOpen(false)}
            >
              {t("pages.freightDetail.cancel")}
            </Button>
            <Button
              type="button"
              className="bg-amber-600 text-white hover:bg-amber-700"
              disabled={isSaving}
              onClick={() => void handleAction("cancel")}
            >
              {t("pages.freightDetail.confirmCancel")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminPageShell>
  );
};

export default AdminFreightDetailPage;
