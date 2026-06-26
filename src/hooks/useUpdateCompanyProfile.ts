import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { useAuth } from "@/context/AuthContext";
import type { CompanyData } from "@/hooks/useGetCompany";
import http from "@/service/http";
import {
  COUNTRY_OPTIONS,
  DEFAULT_COUNTRY,
  getCountryStateOptions,
} from "@/utils/address";
import {
  buildPhoneE164,
  getDefaultPhoneCountryCodeByCountry,
} from "@/utils/phone";
import { trataErroAxios, traduzMensagemApi } from "@/utils/trataErroAxios";
import { applyRhfFieldErrors, parseApiFieldErrors } from "@/utils/apiFieldErrors";
import {
  validateCepByCountry,
  validateCNPJ,
  validateCountry,
  validateDate,
  validatePhone,
  validatePhoneCountryCode,
  validateRequired,
  validateUf,
} from "@/utils/validation";

type ViaCepResponse = {
  erro?: boolean;
  logradouro?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
};

type UpdateResponse = {
  message?: string;
};

type UseUpdateCompanyProfileParams = {
  companyData: CompanyData | null;
  handleGetCompany: () => Promise<void>;
};

export type CompanyProfileFormData = {
  name: string;
  cnpj: string;
  phoneCountryCode: string;
  phoneNumber: string;
  birthFundation: string;
  website: string;
  country: string;
  cep: string;
  street: string;
  district: string;
  number: string;
  city: string;
  state: string;
};

function getDefaultValues(companyData: CompanyData | null): CompanyProfileFormData {
  return {
    name: companyData?.name ?? "",
    cnpj: companyData?.cnpj ?? "",
    phoneCountryCode:
      companyData?.phoneCountryCode ||
      getDefaultPhoneCountryCodeByCountry(companyData?.country ?? DEFAULT_COUNTRY),
    phoneNumber: companyData?.phoneNumber ?? "",
    birthFundation: companyData?.birthFundation ?? "",
    website: companyData?.website ?? "",
    country: companyData?.country ?? DEFAULT_COUNTRY,
    cep: companyData?.cep ?? "",
    street: companyData?.street ?? "",
    district: companyData?.district ?? "",
    number: companyData?.number ?? "",
    city: companyData?.city ?? "",
    state: companyData?.state ?? "",
  };
}

function trimValue(value: string) {
  return value.trim();
}

export function useUpdateCompanyProfile({
  companyData,
  handleGetCompany,
}: UseUpdateCompanyProfileParams) {
  const { id } = useAuth();
  const { t } = useTranslation();
  const [isSearchingCep, setIsSearchingCep] = useState(false);
  const serverCepRef = useRef<string | null>(null);

  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    setError,
    watch,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<CompanyProfileFormData>({
    mode: "onBlur",
    defaultValues: getDefaultValues(companyData),
  });

  const country = watch("country");
  const cep = watch("cep");
  const state = watch("state");
  const stateOptions = useMemo(() => getCountryStateOptions(country), [country]);
  const hasStateOptions = stateOptions.length > 0;

  useEffect(() => {
    const defaults = getDefaultValues(companyData);
    serverCepRef.current = defaults.cep.replace(/\D/g, "") || null;
    reset(defaults);
  }, [companyData, reset]);

  useEffect(() => {
    if (!hasStateOptions) return;

    if (state && !stateOptions.some((option) => option.value === state)) {
      setValue("state", "", { shouldDirty: false });
    }
  }, [hasStateOptions, setValue, state, stateOptions]);

  useEffect(() => {
    const digits = cep?.replace(/\D/g, "") ?? "";

    if (country !== "BR" || digits.length !== 8) return;

    if (serverCepRef.current !== null && digits === serverCepRef.current) {
      return;
    }

    const controller = new AbortController();

    const fetchAddress = async () => {
      try {
        setIsSearchingCep(true);

        const response = await fetch(`https://viacep.com.br/ws/${digits}/json/`, {
          signal: controller.signal,
        });

        const data = (await response.json()) as ViaCepResponse;

        if (!response.ok || data.erro) {
          toast.error(t("pages.profile.cepNotFound"));
          return;
        }

        if (data.logradouro?.trim()) {
          setValue("street", data.logradouro.trim(), { shouldValidate: true });
        }
        if (data.bairro?.trim()) {
          setValue("district", data.bairro.trim(), { shouldValidate: true });
        }
        if (data.localidade?.trim()) {
          setValue("city", data.localidade.trim(), { shouldValidate: true });
        }
        if (data.uf?.trim()) {
          setValue("state", data.uf.trim(), { shouldValidate: true });
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        toast.error(t("pages.profile.cepLookupError"));
      } finally {
        setIsSearchingCep(false);
      }
    };

    void fetchAddress();

    return () => controller.abort();
  }, [cep, country, setValue, t]);

  const rules = {
    name: {
      required: t("validation.nameRequired"),
      validate: (value: string | undefined) =>
        !value || value.trim().length >= 3 || t("validation.nameInvalid"),
    },
    cnpj: {
      required: t("validation.cnpjRequired"),
      validate: (value: string | undefined) =>
        !value || validateCNPJ(value) || t("validation.cnpjInvalid"),
    },
    phoneCountryCode: {
      required: t("validation.phoneCountryCodeRequired"),
      validate: (value: string | undefined) =>
        !value ||
        validatePhoneCountryCode(value) ||
        t("validation.phoneCountryCodeInvalid"),
    },
    phoneNumber: {
      required: t("validation.phoneRequired"),
      validate: (value: string | undefined, formValues: CompanyProfileFormData) =>
        !value ||
        validatePhone(formValues.phoneCountryCode, value) ||
        t("validation.phoneInvalid"),
    },
    birthFundation: {
      required: t("validation.birthFundationRequired"),
      validate: (value: string | undefined) =>
        !value || validateDate(value) || t("validation.birthFundationInvalid"),
    },
    country: {
      required: t("validation.countryRequired"),
      validate: (value: string | undefined) =>
        !value || validateCountry(value) || t("validation.countryInvalid"),
    },
    cep: {
      required: t("validation.cepRequired"),
      validate: (value: string | undefined, formValues: CompanyProfileFormData) =>
        !value ||
        validateCepByCountry(value, formValues.country) ||
        t("validation.cepInvalid"),
    },
    street: {
      required: t("validation.streetRequired"),
      validate: (value: string | undefined) =>
        !value || validateRequired(value) || t("validation.streetRequired"),
    },
    district: {
      required: t("validation.districtRequired"),
      validate: (value: string | undefined) =>
        !value || validateRequired(value) || t("validation.districtRequired"),
    },
    number: {
      required: t("validation.numberRequired"),
      validate: (value: string | undefined) =>
        !value || validateRequired(value) || t("validation.numberRequired"),
    },
    city: {
      required: t("validation.cityRequired"),
      validate: (value: string | undefined) =>
        !value || validateRequired(value) || t("validation.cityRequired"),
    },
    state: {
      required: t("validation.stateRequired"),
      validate: (value: string | undefined, formValues: CompanyProfileFormData) => {
        if (!value) return true;
        if (formValues.country === "BR") {
          return validateUf(value) || t("validation.stateInvalid");
        }

        return validateRequired(value) || t("validation.stateRequired");
      },
    },
  };

  const handleReset = useCallback(() => {
    reset(getDefaultValues(companyData));
  }, [companyData, reset]);

  const handleSave = handleSubmit(async (values) => {
    if (!id) {
      toast.error(t("COMPANY.COMPANY_NOT_FOUND"));
      return;
    }

    const toastId = toast.loading(t("pages.profile.saving"));

    try {
      const website = trimValue(values.website);
      const companyPayload: Record<string, string | null> = {
        name: trimValue(values.name),
        phoneNumber: buildPhoneE164(values.phoneCountryCode, values.phoneNumber),
        birthFundation: values.birthFundation,
        website: website || null,
      };

      const addressPayload = {
        country: trimValue(values.country).toUpperCase(),
        cep: values.cep.replace(/\D/g, ""),
        street: trimValue(values.street),
        district: trimValue(values.district),
        number: trimValue(values.number),
        city: trimValue(values.city),
        state:
          values.country === "BR"
            ? trimValue(values.state).toUpperCase()
            : trimValue(values.state),
      };

      const { data: companyResponse } = await http.put<UpdateResponse>(
        `/company/${id}`,
        companyPayload
      );

      let addressResponse: UpdateResponse | undefined;

      if (companyData?.addressId) {
        const response = await http.put<UpdateResponse>(
          `/address/${companyData.addressId}`,
          addressPayload
        );
        addressResponse = response.data;
      } else {
        const response = await http.post<UpdateResponse>("/address", addressPayload);
        addressResponse = response.data;
      }

      await handleGetCompany();

      toast.success(
        traduzMensagemApi(addressResponse?.message ?? companyResponse.message) ??
          t("pages.profile.savedOk"),
        { id: toastId }
      );
    } catch (error) {
      const parsed = parseApiFieldErrors(error);
      if (parsed?.fieldErrors.length) {
        applyRhfFieldErrors(setError, parsed.fieldErrors);
      }
      toast.error(parsed?.summary ?? trataErroAxios(error), { id: toastId });
    }
  });

  return {
    control,
    register,
    watch,
    setValue,
    errors,
    isDirty,
    isSubmitting,
    isSearchingCep,
    countryOptions: COUNTRY_OPTIONS,
    stateOptions,
    hasStateOptions,
    rules,
    handleReset,
    handleSave,
  };
}
