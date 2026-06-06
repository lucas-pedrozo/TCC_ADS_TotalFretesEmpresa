import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { AdminConfirmDeleteDialog } from "@/components/admin/AdminConfirmDeleteDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import http from "@/service/http";
import type { AdminVehicle, AdminVehicleType } from "@/types/admin";
import { resolveSelectLabel } from "@/utils/adminFormat";
import { maskPlate, maskUf } from "@/utils/mask";
import { trataErroAxios, traduzMensagemApi } from "@/utils/trataErroAxios";

const AdminVehicleDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [vehicle, setVehicle] = useState<AdminVehicle | null>(null);
  const [vehicleTypes, setVehicleTypes] = useState<AdminVehicleType[]>([]);
  const [form, setForm] = useState({
    plateNumber: "",
    chassisNumber: "",
    model: "",
    mark: "",
    city: "",
    stateUF: "",
    country: "",
    vehicleType_id: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const [vehicleRes, typesRes] = await Promise.all([
        http.get<AdminVehicle>(`/vehicle/${id}`),
        http.get<AdminVehicleType[]>("/vehicle-type"),
      ]);
      setVehicle(vehicleRes.data);
      setVehicleTypes(Array.isArray(typesRes.data) ? typesRes.data : []);
      const v = vehicleRes.data;
      setForm({
        plateNumber: v.plateNumber ? maskPlate(v.plateNumber) : "",
        chassisNumber: v.chassisNumber ?? "",
        model: v.model ?? "",
        mark: v.mark ?? "",
        city: v.city ?? "",
        stateUF: v.stateUF ?? "",
        country: v.country ?? "",
        vehicleType_id: String(v.vehicleType_id ?? ""),
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

  const vehicleTypeOptions = useMemo(
    () => vehicleTypes.map((type) => ({ id: type.id, label: type.nome })),
    [vehicleTypes]
  );

  const selectedVehicleTypeLabel = resolveSelectLabel(
    form.vehicleType_id,
    vehicleTypeOptions,
    vehicle?.VehicleType?.nome ?? vehicle?.VehicleType?.name ?? null
  );

  const isBrazil = form.country.trim().toUpperCase() === "BR";

  const handleSave = async () => {
    if (!id) return;
    setIsSaving(true);
    const toastId = toast.loading(t("pages.admin.common.saving"));
    try {
      const { data } = await http.put(`/vehicle/${id}`, {
        plateNumber: form.plateNumber.trim().replace(/-/g, ""),
        chassisNumber: form.chassisNumber.trim(),
        model: form.model.trim() || null,
        mark: form.mark.trim() || null,
        city: form.city.trim(),
        stateUF: isBrazil ? maskUf(form.stateUF) : form.stateUF.trim(),
        country: form.country.trim(),
        vehicleType_id: Number(form.vehicleType_id),
      });
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

  const handleDelete = async () => {
    if (!id) return;
    setIsSaving(true);
    const toastId = toast.loading(t("pages.admin.common.deleting"));
    try {
      const { data } = await http.delete(`/vehicle/${id}`);
      toast.success(traduzMensagemApi(data.message) ?? t("pages.admin.common.deleted"), {
        id: toastId,
      });
      navigate("/admin/vehicles");
    } catch (error) {
      toast.error(trataErroAxios(error), { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <AdminPageShell title={t("pages.admin.vehicles.detailTitle")}>
        <Skeleton className="h-40 w-full max-w-xl" />
      </AdminPageShell>
    );
  }

  if (!vehicle) {
    return (
      <AdminPageShell title={t("pages.admin.vehicles.detailTitle")}>
        <p className="text-sm text-muted-foreground">{t("pages.admin.common.notFound")}</p>
      </AdminPageShell>
    );
  }

  return (
    <AdminPageShell
      title={t("pages.admin.vehicles.detailTitle")}
      description={vehicle.plateNumber}
      actions={
        <>
          <Button variant="outline" render={<Link to="/admin/vehicles" />}>
            {t("pages.admin.common.back")}
          </Button>
          <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
            {t("pages.admin.common.delete")}
          </Button>
          <Button onClick={() => void handleSave()} disabled={isSaving}>
            {t("pages.admin.common.save")}
          </Button>
        </>
      }
    >
      <div className="grid max-w-2xl gap-4 sm:grid-cols-2">
        {(
          [
            ["plateNumber", t("pages.admin.vehicles.plate")],
            ["chassisNumber", t("pages.admin.vehicles.chassis")],
            ["model", t("pages.admin.vehicles.model")],
            ["mark", t("pages.admin.vehicles.mark")],
            ["city", t("pages.admin.companies.city")],
            ["stateUF", t("pages.admin.companies.state")],
            ["country", t("pages.admin.companies.country")],
          ] as const
        ).map(([key, label]) => (
          <div key={key} className="space-y-2">
            <Label htmlFor={`vehicle-${key}`}>{label}</Label>
            <Input
              id={`vehicle-${key}`}
              maxLength={
                key === "country" ? 2 : key === "stateUF" && isBrazil ? 2 : key === "plateNumber" ? 8 : undefined
              }
              value={
                key === "plateNumber"
                  ? maskPlate(form.plateNumber)
                  : key === "stateUF" && isBrazil
                    ? maskUf(form.stateUF)
                    : key === "country"
                      ? form.country.toUpperCase()
                      : form[key]
              }
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  [key]:
                    key === "plateNumber"
                      ? maskPlate(event.target.value)
                      : key === "stateUF" && isBrazil
                        ? maskUf(event.target.value)
                        : key === "country"
                          ? event.target.value.toUpperCase().slice(0, 2)
                          : event.target.value,
                }))
              }
            />
          </div>
        ))}
        <div className="space-y-2 sm:col-span-2">
          <Label>{t("pages.admin.vehicles.type")}</Label>
          <Select
            value={form.vehicleType_id}
            onValueChange={(value) =>
              setForm((prev) => ({ ...prev, vehicleType_id: value ?? "" }))
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t("pages.admin.vehicles.selectType")}>
                {selectedVehicleTypeLabel}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {vehicleTypes.map((type) => (
                <SelectItem key={type.id} value={String(type.id)}>
                  {type.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <AdminConfirmDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={t("pages.admin.common.confirmDeleteTitle")}
        description={t("pages.admin.vehicles.deleteConfirm", {
          plate: vehicle.plateNumber,
        })}
        onConfirm={handleDelete}
        isLoading={isSaving}
      />
    </AdminPageShell>
  );
};

export default AdminVehicleDetailPage;
