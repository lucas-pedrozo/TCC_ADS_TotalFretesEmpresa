import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useRegisterCompanyContext, type RegisterCompanyDataAddress, type RegisterCompanyDraftData, ACCOUNT_TYPE_COMPANY } from "@/context/RegisterCompanyContext";
import { trataErroAxios } from "@/utils/trataErroAxios";
import { validateCepByCountry, validateCountry, validateRequired, validateUf } from "@/utils/validation";
import { COUNTRY_OPTIONS, getCountryStateOptions } from "@/utils/address";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

type ViaCepResponse = {
  erro?: boolean;
  logradouro?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
};

export function useRegisterCompanyAddress(
  onRegister: (payload: RegisterCompanyDraftData) => void | Promise<void>
) {
  const { basicData, addressData, setDataAddress } = useRegisterCompanyContext();
  const { t } = useTranslation();
  const { control, handleSubmit, setValue, watch, formState: { errors } } =
    useForm<RegisterCompanyDataAddress>({ mode: "onSubmit", defaultValues: addressData });
  const country = watch("country");
  const cep = watch("cep");
  const state = watch("state");
  const stateOptions = useMemo(() => getCountryStateOptions(country), [country]);
  const hasStateOptions = stateOptions.length > 0;
  const [isSearchingCep, setIsSearchingCep] = useState(false);

  useEffect(() => {
    if (!hasStateOptions) return;

    if (state && !stateOptions.some((option) => option.value === state)) {
      setValue("state", "");
    }
  }, [hasStateOptions, setValue, state, stateOptions]);

  useEffect(() => {
    const digits = cep?.replace(/\D/g, "") ?? "";

    if (country !== "BR" || digits.length !== 8) return;

    const controller = new AbortController();

    const fetchAddress = async () => {
      try {
        setIsSearchingCep(true);
        const response = await fetch(`https://viacep.com.br/ws/${digits}/json/`, {
          signal: controller.signal,
        });
        const data = await response.json() as ViaCepResponse;

        if (!response.ok || data.erro) {
          toast.error(t("pages.singupAddress.cepNotFound"));
          return;
        }

        setValue("street", data.logradouro ?? "", { shouldValidate: true });
        setValue("district", data.bairro ?? "", { shouldValidate: true });
        setValue("city", data.localidade ?? "", { shouldValidate: true });
        setValue("state", data.uf ?? "", { shouldValidate: true });
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        toast.error(t("pages.singupAddress.cepLookupError"));
      } finally {
        setIsSearchingCep(false);
      }
    };

    void fetchAddress();

    return () => controller.abort();
  }, [cep, country, setValue, t]);

  const handleNextCompanyAddress = useCallback(() => {
    try {
      handleSubmit((data) => {
        setDataAddress(data);
        void onRegister({ ...basicData, ...data, account_type_id: ACCOUNT_TYPE_COMPANY });
      })();
    } catch (error) {
      toast.error(trataErroAxios(error));
    }
  }, [handleSubmit, setDataAddress, onRegister, basicData]);

  const Rules = {
    country: {
      required: t("validation.countryRequired"),
      validate: (value: string | undefined) => !value || validateCountry(value) || t("validation.countryInvalid"),
    },
    cep: {
      required: t("validation.cepRequired"),
      validate: (value: string | undefined, formValues: RegisterCompanyDataAddress) =>
        !value || validateCepByCountry(value, formValues.country) || t("validation.cepInvalid"),
    },
    street: {
      required: t("validation.streetRequired"),
      validate: (value: string | undefined) => !value || validateRequired(value) || t("validation.streetRequired"),
    },
    district: {
      required: t("validation.districtRequired"),
      validate: (value: string | undefined) => !value || validateRequired(value) || t("validation.districtRequired"),
    },
    number: {
      required: t("validation.numberRequired"),
      validate: (value: string | undefined) => !value || validateRequired(value) || t("validation.numberRequired"),
    },
    city: {
      required: t("validation.cityRequired"),
      validate: (value: string | undefined) => !value || validateRequired(value) || t("validation.cityRequired"),
    },
    state: {
      required: t("validation.stateRequired"),
      validate: (value: string | undefined, formValues: RegisterCompanyDataAddress) => {
        if (!value) return true;
        if (formValues.country === "BR") return validateUf(value) || t("validation.stateInvalid");
        return validateRequired(value) || t("validation.stateRequired");
      },
    },
  };

  return {
    Rules,
    countryOptions: COUNTRY_OPTIONS,
    country,
    stateOptions,
    hasStateOptions,
    isSearchingCep,
    control,
    errors,
    handleSubmit,
    handleNextCompanyAddress,
  };
}