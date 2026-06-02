import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import http from "@/service/http";
import { traduzMensagemApi, trataErroAxios } from "@/utils/trataErroAxios";
import { validateEmail } from "@/utils/validation";

type ForgotPasswordData = {
  email: string;
};

export function useForgotPassword(onSuccess: (email: string) => void) {
  const { t } = useTranslation();
  const { control, handleSubmit } = useForm<ForgotPasswordData>({ mode: "onSubmit" });
  const [isLoading, setIsLoading] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);

  const handleForgotPassword = useCallback(async (data: ForgotPasswordData) => {
    const toastId = toast.loading(t("pages.forgotPassword.loading"));
    try {
      setIsLoading(true);
      setIsDisabled(true);

      const email = data.email.trim().toLowerCase();
      const response = await http.post("/auth/forgot-password", { email });

      toast.success(
        traduzMensagemApi(response.data?.message) ?? t("pages.forgotPassword.success"),
        { id: toastId },
      );
      onSuccess(email);
    } catch (error) {
      toast.error(trataErroAxios(error), { id: toastId });
    } finally {
      setIsLoading(false);
      setIsDisabled(false);
    }
  }, [onSuccess, t]);

  const Rules = {
    email: {
      required: t("validation.emailRequired"),
      validate: (value: string | undefined) => !value || validateEmail(value) || t("validation.emailInvalid"),
    },
  };

  return {
    Rules,
    control,
    handleSubmit,
    handleForgotPassword,
    isLoading,
    isDisabled,
  };
}
