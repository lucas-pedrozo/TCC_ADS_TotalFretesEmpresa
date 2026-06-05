import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import type { MapPinValue } from "@/components/maps/AddressMapPicker";
import { AddressMapPicker } from "@/components/maps/AddressMapPicker";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import http from "@/service/http";
import type { AdminCompany } from "@/types/admin";
import type { CargoTypeDto, FreightCreateResponse } from "@/types/freight";
import { buildFreightCreateBody, isValidMapPin } from "@/utils/freightCreate";
import { trataErroAxios, traduzMensagemApi } from "@/utils/trataErroAxios";

const MAPBOX_PK = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN?.trim() ?? "";

const AdminFreightNewPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<AdminCompany[]>([]);
  const [cargoTypes, setCargoTypes] = useState<CargoTypeDto[]>([]);
  const [companyId, setCompanyId] = useState("");
  const [origin, setOrigin] = useState<MapPinValue | null>(null);
  const [destination, setDestination] = useState<MapPinValue | null>(null);
  const [form, setForm] = useState({
    name: "",
    cargoType_id: "",
    originalValue: "",
    weight: "",
    daysLimit: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const [companiesRes, cargoRes] = await Promise.all([
          http.get<AdminCompany[]>("/company"),
          http.get<CargoTypeDto[]>("/cargo-type"),
        ]);
        setCompanies(Array.isArray(companiesRes.data) ? companiesRes.data : []);
        setCargoTypes(Array.isArray(cargoRes.data) ? cargoRes.data : []);
      } catch (error) {
        toast.error(trataErroAxios(error));
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!companyId || !isValidMapPin(origin) || !isValidMapPin(destination)) {
      toast.error(t("pages.admin.freights.validationMissing"));
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading(t("pages.admin.common.saving"));
    try {
      const body = buildFreightCreateBody(
        {
          name: form.name.trim(),
          cargoType_id: Number(form.cargoType_id),
          originalValue: Number(form.originalValue),
          weight: Number(form.weight),
          daysLimit: form.daysLimit ? Number(form.daysLimit) : undefined,
        },
        origin,
        destination
      );

      const { data } = await http.post<FreightCreateResponse>("/freight", {
        ...body,
        company_id: Number(companyId),
      });

      toast.success(traduzMensagemApi(data.message) ?? t("pages.admin.common.created"), {
        id: toastId,
      });
      navigate(`/admin/freights/${data.freight.id}`);
    } catch (error) {
      toast.error(trataErroAxios(error), { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  }, [companyId, destination, form, navigate, origin, t]);

  return (
    <AdminPageShell
      title={t("pages.admin.freights.createTitle")}
      description={t("pages.admin.freights.createDescription")}
      actions={
        <Button variant="outline" render={<Link to="/admin/freights" />}>
          {t("pages.admin.common.back")}
        </Button>
      }
    >
      <div className="grid max-w-3xl gap-6">
        <div className="space-y-2">
          <Label>{t("pages.admin.freights.company")}</Label>
          <Select value={companyId} onValueChange={(value) => setCompanyId(value ?? "")}>
            <SelectTrigger disabled={isLoading}>
              <SelectValue placeholder={t("pages.admin.freights.selectCompany")} />
            </SelectTrigger>
            <SelectContent>
              {companies.map((company) => (
                <SelectItem key={company.id} value={String(company.id)}>
                  {company.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="new-freight-name">{t("pages.admin.common.name")}</Label>
            <Input
              id="new-freight-name"
              value={form.name}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, name: event.target.value }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label>{t("pages.admin.freights.cargoType")}</Label>
            <Select
              value={form.cargoType_id}
              onValueChange={(value) =>
                setForm((prev) => ({ ...prev, cargoType_id: value ?? "" }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder={t("pages.admin.freights.selectCargoType")} />
              </SelectTrigger>
              <SelectContent>
                {cargoTypes.map((type) => (
                  <SelectItem key={type.id} value={String(type.id)}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-freight-value">{t("pages.admin.freights.value")}</Label>
            <Input
              id="new-freight-value"
              type="number"
              value={form.originalValue}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, originalValue: event.target.value }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-freight-weight">{t("pages.admin.freights.weight")}</Label>
            <Input
              id="new-freight-weight"
              type="number"
              value={form.weight}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, weight: event.target.value }))
              }
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>{t("pages.admin.freights.origin")}</Label>
          <AddressMapPicker
            accessToken={MAPBOX_PK}
            value={origin}
            onChange={setOrigin}
          />
        </div>
        <div className="space-y-2">
          <Label>{t("pages.admin.freights.destination")}</Label>
          <AddressMapPicker
            accessToken={MAPBOX_PK}
            value={destination}
            onChange={setDestination}
          />
        </div>

        <Button
          type="button"
          className="w-full sm:w-auto"
          disabled={isSubmitting}
          onClick={() => void handleSubmit()}
        >
          {t("pages.admin.freights.create")}
        </Button>
      </div>
    </AdminPageShell>
  );
};

export default AdminFreightNewPage;
