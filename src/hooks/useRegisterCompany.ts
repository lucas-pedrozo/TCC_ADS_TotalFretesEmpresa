import { useCallback, useState } from "react";
import http from "@/service/http";
import { trataErroAxios } from "@/utils/trataErroAxios";
import { parseApiFieldErrors } from "@/utils/apiFieldErrors";
import { normalizeCnpj } from "@/utils/cnpjInRfb2229";
import { buildPhoneE164 } from "@/utils/phone";
import { useRegisterCompanyContext, type RegisterCompanyDraftData } from "@/context/RegisterCompanyContext";
import { useNavigate, type NavigateFunction } from "react-router-dom";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { setPaymentToken } from "@/constants/signupPayment";

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
  const { getPayload, reset, setFieldErrors } = useRegisterCompanyContext();
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
      const response = await http.post<{ paymentToken?: string }>("/company/end-account/", data);
      const paymentToken = response.data.paymentToken;

      if (!paymentToken) {
        throw new Error(t("register.paymentTokenMissing"));
      }

      reset();
      setPaymentToken(paymentToken);
      toast.success(t("register.accountCreated"), { id: toastId });
      navigate("/SignUpPlan");
    } catch (error) {
      const parsed = parseApiFieldErrors(error);
      if (parsed?.fieldErrors.length) {
        setFieldErrors(parsed.fieldErrors);
        const basicFields = new Set(["email", "cnpj", "phoneNumber"]);
        if (parsed.fieldErrors.some((item) => basicFields.has(item.field))) {
          navigate("/SignUp");
        }
      }
      toast.error(parsed?.summary ?? trataErroAxios(error), { id: toastId });
    } finally {
      setIsLoading(false);
      setIsDisabled(false);
    }
  }, [getPayload, reset, navigate, setFieldErrors, t]);

  return {
    handleRegisterCompany,
    isLoading,
    isDisabled,
  };
}