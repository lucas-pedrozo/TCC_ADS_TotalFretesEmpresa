
import { useRegisterCompanyContext, type RegisterCompanyDataBasic } from "@/context/RegisterCompanyContext";
import { trataErroAxios } from "@/utils/trataErroAxios";
import { validateCNPJ, validateDate, validateEmail, validatePassword, validatePasswordConfirmation, validatePhone } from "@/utils/validation";
import { useCallback } from "react"
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

export function useRegisterCompanyBasic(onClickNext: () => void) {
  const { basicData, setDataBasic } = useRegisterCompanyContext();
  const { t } = useTranslation();
  const { control, handleSubmit, formState: { errors } } =
    useForm<RegisterCompanyDataBasic>({ mode: "onSubmit", defaultValues: basicData });

  const handleNextCompanyBasic = useCallback(() => {
    try {
      handleSubmit((data) => {
        setDataBasic(data);
        onClickNext();
      })();
    } catch (error) {
      toast.error(trataErroAxios(error));
    }
  }, [handleSubmit, setDataBasic, onClickNext])

  const Rules = {
    email: {
      required: t("validation.emailRequired"),
      validate: (value: string | undefined) => !value || validateEmail(value) || t("validation.emailInvalid")
    },
    name: {
      required: t("validation.nameRequired"),
      validate: (value: string | undefined) => !value || value.trim().length >= 3 || t("validation.nameInvalid")
    },
    birthFundation: {
      required: t("validation.birthFundationRequired"),
      validate: (value: string | undefined) => !value || validateDate(value) || t("validation.birthFundationInvalid"),
    },
    phoneNumber: {
      required: t("validation.phoneRequired"),
      validate: (value: string | undefined) => !value || validatePhone(value) || t("validation.phoneInvalid"),
    },
    cnpj: {
      required: t("validation.cnpjRequired"),
      validate: (value: string | undefined) => !value || validateCNPJ(value) || t("validation.cnpjInvalid")
    },
    password: {
      required: t("validation.passwordRequired"),
      validate: (value: string | undefined) => !value || validatePassword(value) || t("validation.passwordInvalid"),
    },
    confirmPassword: {
      required: t("validation.confirmPasswordRequired"),
      validate: (value: string | undefined, formValues: RegisterCompanyDataBasic) =>
        !value ||
        validatePasswordConfirmation(formValues.password, value) ||
        t("validation.confirmPasswordInvalid"),
    }
  }

  return {
    Rules,
    control,
    errors,
    handleSubmit,
    handleNextCompanyBasic,
  }
}