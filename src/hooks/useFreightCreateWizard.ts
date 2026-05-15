import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import type { MapPinValue } from "@/components/maps/AddressMapPicker";
import { useGetCompany } from "@/hooks/useGetCompany";
import type {
  CargoTypeDto,
  FreightCargoStepBody,
  FreightCreateResponse,
  FreightWizardStep,
} from "@/types/freight";
import http from "@/service/http";
import {
  buildFreightCreateBody,
  formatCompanyAddressLine,
  isSameMapPin,
  isValidMapPin,
} from "@/utils/freightCreate";
import { traduzMensagemApi, trataErroAxios } from "@/utils/trataErroAxios";

export function useFreightCreateWizard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { companyData, handleGetCompany } = useGetCompany();

  const [step, setStep] = useState<FreightWizardStep>(1);
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
    void handleGetCompany();
  }, [handleGetCompany]);

  const initialOriginQuery = useMemo(
    () => formatCompanyAddressLine(companyData),
    [companyData]
  );

  const syncOrigin = useCallback((next: MapPinValue | null) => {
    setOrigin((prev) => (isSameMapPin(prev, next) ? prev : next));
  }, []);

  const syncDestination = useCallback((next: MapPinValue | null) => {
    setDestination((prev) => (isSameMapPin(prev, next) ? prev : next));
  }, []);

  const handleCreate = useCallback(
    async (cargo: FreightCargoStepBody) => {
      if (!isValidMapPin(origin) || !isValidMapPin(destination)) {
        toast.error(t("pages.freightWizard.pinRequired"));
        return;
      }
      const body = buildFreightCreateBody(cargo, origin, destination);
      try {
        setSubmitting(true);
        const { data } = await http.post<FreightCreateResponse>("/freight", body);
        toast.success(traduzMensagemApi(data.message) ?? t("pages.freightDetail.createdOk"));
        const bid = data.freight?.id;
        if (bid != null) navigate(`/Freights/${bid}`, { replace: true });
        else navigate("/Freights", { replace: true });
      } catch (e) {
        toast.error(trataErroAxios(e));
      } finally {
        setSubmitting(false);
      }
    },
    [destination, navigate, origin, t]
  );

  const handleStepNext = useCallback(() => {
    if (step === 1) {
      if (!isValidMapPin(origin)) {
        toast.error(t("pages.freightWizard.pinRequired"));
        return;
      }
      setStep(2);
      return;
    }
    if (step === 2) {
      if (!isValidMapPin(destination)) {
        toast.error(t("pages.freightWizard.pinRequired"));
        return;
      }
      setStep(3);
    }
  }, [destination, origin, step, t]);

  const handleStepBack = useCallback(() => {
    if (step === 1) navigate("/Freights");
    else if (step === 2) setStep(1);
    else setStep(2);
  }, [navigate, step]);

  return {
    step,
    origin,
    destination,
    cargoTypes,
    loadingMeta,
    submitting,
    initialOriginQuery,
    syncOrigin,
    syncDestination,
    handleCreate,
    handleStepNext,
    handleStepBack,
  };
}
