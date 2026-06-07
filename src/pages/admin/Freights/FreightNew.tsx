import { useCallback, useEffect, useMemo, useState } from "react";
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
import { normalizeLanguage } from "@/i18n";
import http from "@/service/http";
import type { AdminCompany } from "@/types/admin";
import type { CargoTypeDto, FreightCreateResponse } from "@/types/freight";
import { resolveSelectLabel, sanitizeAdminDigitsInput } from "@/utils/adminFormat";
import { buildFreightCreateBody, isValidMapPin } from "@/utils/freightCreate";
import {
  centsDigitsToAmount,
  currencyInputPlaceholder,
  formatCurrencyInputDisplay,
  formatFreightWeightAmount,
  sanitizeCurrencyCentsInput,
  sanitizeWeightDigitsInput,
  weightDigitsToKg,
  weightInputPlaceholder,
} from "@/utils/freightFormat";
import { trataErroAxios, traduzMensagemApi } from "@/utils/trataErroAxios";

const MAPBOX_PK = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN?.trim() ?? "";

const AdminFreightNewPage = () => {
  const { t, i18n } = useTranslation();
  const lang = normalizeLanguage(i18n.language);
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<AdminCompany[]>([]);
  const [cargoTypes, setCargoTypes] = useState<CargoTypeDto[]>([]);
  const [companyId, setCompanyId] = useState("");
  const [origin, setOrigin] = useState<MapPinValue | null>(null);
  const [destination, setDestination] = useState<MapPinValue | null>(null);
  const [form, setForm] = useState({
    name: "",
    cargoType_id: "",
    originalValueCents: "",
    weightDigits: "",
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

  const companyOptions = useMemo(
    () => companies.map((company) => ({ id: company.id, label: company.name })),
    [companies]
  );
  const cargoOptions = useMemo(
    () => cargoTypes.map((type) => ({ id: type.id, label: type.name ?? "" })),
    [cargoTypes]
  );

  const selectedCompanyLabel = resolveSelectLabel(companyId, companyOptions);
  const selectedCargoLabel = resolveSelectLabel(form.cargoType_id, cargoOptions);

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
          originalValue: centsDigitsToAmount(form.originalValueCents),
          weight: weightDigitsToKg(form.weightDigits),
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

  const currencyPrefix = lang === "en" ? "$" : "R$";

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
            <SelectTrigger className="w-full" disabled={isLoading}>
              <SelectValue placeholder={t("pages.admin.freights.selectCompany")}>
                {selectedCompanyLabel}
              </SelectValue>
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
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t("pages.admin.freights.selectCargoType")}>
                  {selectedCargoLabel}
                </SelectValue>
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
            <div className="relative">
              <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-muted-foreground">
                {currencyPrefix}
              </span>
              <Input
                id="new-freight-value"
                inputMode="numeric"
                className="pl-10"
                placeholder={currencyInputPlaceholder(lang)}
                value={formatCurrencyInputDisplay(form.originalValueCents, lang)}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    originalValueCents: sanitizeCurrencyCentsInput(event.target.value),
                  }))
                }
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-freight-weight">{t("pages.admin.freights.weight")}</Label>
            <div className="relative">
              <Input
                id="new-freight-weight"
                inputMode="numeric"
                placeholder={weightInputPlaceholder(lang)}
                value={
                  form.weightDigits
                    ? formatFreightWeightAmount(Number(form.weightDigits), lang)
                    : ""
                }
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    weightDigits: sanitizeWeightDigitsInput(event.target.value),
                  }))
                }
              />
              <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm text-muted-foreground">
                kg
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-freight-days">{t("pages.admin.freights.daysLimit")}</Label>
            <Input
              id="new-freight-days"
              inputMode="numeric"
              value={form.daysLimit}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  daysLimit: sanitizeAdminDigitsInput(event.target.value, 4),
                }))
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
