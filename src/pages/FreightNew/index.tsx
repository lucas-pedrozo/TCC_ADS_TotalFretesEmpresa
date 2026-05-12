import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { AddressMapPicker, type MapPinValue } from "@/components/maps/AddressMapPicker";
import { FreightForm } from "@/components/ui/freightForm";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useGetCompany, type CompanyData } from "@/hooks/useGetCompany";
import http from "@/service/http";
import type {
  CargoTypeDto,
  FreightCargoStepBody,
  FreightCreateBody,
  FreightDto,
} from "@/types/freight";
import { traduzMensagemApi, trataErroAxios } from "@/utils/trataErroAxios";

function formatCompanyAddressLine(c: CompanyData | null): string | null {
  if (!c) return null;
  try {
    const rawCep = c.cep != null ? String(c.cep) : "";
    const cepDigits = rawCep.replace(/\D/g, "");
    const cepFormatted =
      cepDigits.length === 8
        ? `${cepDigits.slice(0, 5)}-${cepDigits.slice(5)}`
        : rawCep.trim();
    const street = c.street != null ? String(c.street).trim() : "";
    const number = c.number != null ? String(c.number).trim() : "";
    const line1 =
      street && number ? `${street}, ${number}` : street || number || "";
    const district = c.district != null ? String(c.district).trim() : "";
    const city = c.city != null ? String(c.city).trim() : "";
    const state = c.state != null ? String(c.state).trim() : "";
    const cityState = [city, state].filter(Boolean).join(", ");
    const parts = [line1, district, cityState, cepFormatted, "Brazil"]
      .map((p) => p.trim())
      .filter((p) => p.length > 0);
    const s = parts.join(", ");
    return s.length > 2 ? s : null;
  } catch {
    return null;
  }
}

function isValidPin(v: MapPinValue | null): boolean {
  if (!v?.label?.trim()) return false;
  return (
    Number.isFinite(v.lat) &&
    Number.isFinite(v.lng) &&
    v.lat >= -90 &&
    v.lat <= 90 &&
    v.lng >= -180 &&
    v.lng <= 180
  );
}

type CreateResponse = {
  message?: string;
  freight: FreightDto;
};

const MAPBOX_PK = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN?.trim() ?? "";

const FreightNewPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id: companyId } = useAuth();
  const { companyData, handleGetCompany } = useGetCompany();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [origin, setOrigin] = useState<MapPinValue | null>(null);
  const [destination, setDestination] = useState<MapPinValue | null>(null);

  const [cargoTypes, setCargoTypes] = useState<CargoTypeDto[]>([]);
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadMeta = useCallback(async () => {
    try {
      setLoadingMeta(true);
      const { data } = await http.get<CargoTypeDto[]>("/cargo-type");
      setCargoTypes(Array.isArray(data) ? data : []);
    } catch (e) {
      toast.error(trataErroAxios(e));
    } finally {
      setLoadingMeta(false);
    }
  }, []);

  useEffect(() => {
    void loadMeta();
  }, [loadMeta]);

  useEffect(() => {
    if (companyId) void handleGetCompany();
  }, [companyId, handleGetCompany]);

  const initialOriginQuery = useMemo(() => {
    try {
      return formatCompanyAddressLine(companyData);
    } catch {
      return null;
    }
  }, [companyData]);

  async function handleCreate(cargo: FreightCargoStepBody) {
    if (!isValidPin(origin) || !isValidPin(destination)) {
      toast.error(t("pages.freightWizard.pinRequired"));
      return;
    }
    const body: FreightCreateBody = {
      ...cargo,
      origin_label: origin!.label.trim(),
      origin_lat: origin!.lat,
      origin_lng: origin!.lng,
      destination_label: destination!.label.trim(),
      destination_lat: destination!.lat,
      destination_lng: destination!.lng,
    };
    try {
      setSubmitting(true);
      const { data } = await http.post<CreateResponse>("/freight", body);
      toast.success(traduzMensagemApi(data.message) ?? t("pages.freightDetail.createdOk"));
      const bid = data.freight?.id;
      if (bid != null) navigate(`/Freights/${bid}`, { replace: true });
      else navigate("/Freights", { replace: true });
    } catch (e) {
      toast.error(trataErroAxios(e));
    } finally {
      setSubmitting(false);
    }
  }

  function handleStepNext() {
    if (step === 1) {
      if (!isValidPin(origin)) {
        toast.error(t("pages.freightWizard.pinRequired"));
        return;
      }
      setStep(2);
      return;
    }
    if (step === 2) {
      if (!isValidPin(destination)) {
        toast.error(t("pages.freightWizard.pinRequired"));
        return;
      }
      setStep(3);
    }
  }

  function handleStepBack() {
    if (step === 1) navigate("/Freights");
    else if (step === 2) setStep(1);
    else setStep(2);
  }

  const stepTitle =
    step === 1
      ? t("pages.freightWizard.stepOrigin")
      : step === 2
        ? t("pages.freightWizard.stepDestination")
        : t("pages.freightWizard.stepCargo");

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:p-4 md:p-6">
      <div className="mb-3 flex flex-col gap-3 sm:mb-4 sm:flex-row sm:flex-wrap sm:items-center">
        <Button
          type="button"
          variant="outline"
          className="min-h-11 w-full shrink-0 rounded-lg sm:min-h-9 sm:w-auto"
          onClick={() => navigate("/Freights")}
        >
          {t("pages.freightDetail.back")}
        </Button>
        <h2 className="min-w-0 text-lg font-semibold text-foreground sm:ml-0">
          {t("pages.freightDetail.newTitle")}
        </h2>
      </div>

      <div className="mb-3 -mx-1 flex snap-x snap-mandatory gap-2 overflow-x-auto pb-1 sm:mx-0 sm:mb-4 sm:flex-wrap sm:overflow-visible sm:pb-0">
        {[1, 2, 3].map((n) => (
          <span
            key={n}
            className={
              "shrink-0 snap-start rounded-full px-3 py-2 text-center text-xs font-medium sm:py-1 " +
              (step === n
                ? "bg-brand-green text-white"
                : "bg-muted text-muted-foreground")
            }
          >
            {n}
          </span>
        ))}
        <span className="min-w-[12rem] self-center pl-1 text-sm text-muted-foreground sm:min-w-0 sm:pl-0">
          {t("pages.freightWizard.stepProgress", { current: step })}
        </span>
      </div>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col rounded-xl border border-border bg-card shadow-sm">
        <div className="border-b border-border px-3 py-3 sm:px-6 sm:py-4">
          <h3 className="text-base font-semibold leading-snug text-foreground">{stepTitle}</h3>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4 sm:px-6 sm:py-5">
          {loadingMeta ? (
            <p className="text-sm text-muted-foreground">{t("pages.freightDetail.loading")}</p>
          ) : step === 1 ? (
            <AddressMapPicker
              key="wizard-origin"
              accessToken={MAPBOX_PK}
              initialSearchQuery={initialOriginQuery}
              value={origin}
              onChange={(next) => {
                setOrigin((prev) => {
                  if (prev === next) return prev;
                  if (
                    prev &&
                    next &&
                    prev.label === next.label &&
                    prev.lat === next.lat &&
                    prev.lng === next.lng
                  ) {
                    return prev;
                  }
                  return next;
                });
              }}
            />
          ) : step === 2 ? (
            <AddressMapPicker
              key="wizard-destination"
              accessToken={MAPBOX_PK}
              value={destination}
              onChange={(next) => {
                setDestination((prev) => {
                  if (prev === next) return prev;
                  if (
                    prev &&
                    next &&
                    prev.label === next.label &&
                    prev.lat === next.lat &&
                    prev.lng === next.lng
                  ) {
                    return prev;
                  }
                  return next;
                });
              }}
            />
          ) : (
            <div className="flex flex-col gap-4">
              <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
                {t("pages.freightWizard.cargoStepHint")}
              </p>
              <FreightForm
                cargoTypes={cargoTypes}
                cargoFieldsOnly
                onSubmit={handleCreate}
                submitLabel={t("pages.freightForm.create")}
                isSubmitting={submitting}
              />
            </div>
          )}
        </div>

        {!loadingMeta && step !== 3 ? (
          <div className="sticky bottom-0 z-10 flex shrink-0 flex-col gap-2 border-t border-border bg-card/95 px-3 py-3 backdrop-blur-sm supports-[backdrop-filter]:bg-card/80 sm:static sm:flex-row sm:flex-wrap sm:border-t-0 sm:bg-transparent sm:px-6 sm:py-4 sm:backdrop-blur-none">
            <Button
              type="button"
              variant="outline"
              className="min-h-11 w-full rounded-lg sm:min-h-9 sm:w-auto"
              onClick={handleStepBack}
            >
              {t("pages.freightWizard.back")}
            </Button>
            <Button
              type="button"
              className="min-h-11 w-full rounded-lg bg-brand-green text-white hover:bg-brand-green-dark sm:min-h-9 sm:w-auto sm:min-w-[8rem]"
              onClick={handleStepNext}
            >
              {t("pages.freightWizard.next")}
            </Button>
          </div>
        ) : !loadingMeta && step === 3 ? (
          <div className="flex shrink-0 flex-col gap-2 border-t border-border bg-card/95 px-3 py-3 backdrop-blur-sm supports-[backdrop-filter]:bg-card/80 sm:static sm:flex-row sm:border-t-0 sm:bg-transparent sm:px-6 sm:py-4 sm:backdrop-blur-none">
            <Button
              type="button"
              variant="outline"
              className="min-h-11 w-full rounded-lg sm:min-h-9 sm:w-auto"
              onClick={handleStepBack}
            >
              {t("pages.freightWizard.back")}
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default FreightNewPage;
