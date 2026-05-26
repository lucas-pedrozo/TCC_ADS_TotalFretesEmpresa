import { useCallback, useState } from "react";
import http from "@/service/http";
import { trataErroAxios } from "@/utils/trataErroAxios";
import { normalizeCnpj } from "@/utils/cnpjInRfb2229";
import { buildPhoneE164 } from "@/utils/phone";
import { useRegisterCompanyContext, type RegisterCompanyDraftData } from "@/context/RegisterCompanyContext";
import { useNavigate, type NavigateFunction } from "react-router-dom";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

const onlyDigits = (value: string) => value.replace(/\D/g, "");

const normalizeCompanyPayload = (data: RegisterCompanyDraftData) => {
  return {
    account_type_id: data.account_type_id,
    name: data.name.trim(),
    email: data.email.trim().toLowerCase(),
    birthFundation: data.birthFundation,
    phoneNumber: buildPhoneE164(data.phoneCountryCode, data.phoneNumber),
    website: data.website?.trim() || undefined,
    cnpj: normalizeCnpj(data.cnpj),
    password: data.password,
    country: data.country.trim().toUpperCase(),
    cep: data.country === "BR" ? onlyDigits(data.cep) : data.cep.trim(),
    street: data.street.trim(),
    district: data.district.trim(),
    number: data.number.trim(),
    city: data.city.trim(),
    state: data.state.trim().toUpperCase(),
  };
};

export function useRegisterCompany(navigateOverride?: NavigateFunction) {
  const { getPayload, reset } = useRegisterCompanyContext();
  const [isLoading, setIsLoading] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const navigateDefault = useNavigate();
  const navigate = navigateOverride ?? navigateDefault;
  const { t } = useTranslation();

  const handleRegisterCompany = useCallback(async (payload?: RegisterCompanyDraftData) => {
    const toastId = toast.loading(t("register.loading"));
    try {
      setIsLoading(true);
      setIsDisabled(true);

      const data = normalizeCompanyPayload(payload ?? getPayload());
      await http.post("/company/end-account/", data);

      reset();
      toast.success(t("register.success"), { id: toastId });
      navigate("/Login");
    } catch (error) {
      toast.error(trataErroAxios(error), { id: toastId });
    } finally {
      setIsLoading(false);
      setIsDisabled(false);
    }
  }, [getPayload, reset, navigate, t]);

  return {
    handleRegisterCompany,
    isLoading,
    isDisabled,
  };
}