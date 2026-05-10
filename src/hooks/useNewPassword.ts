import { useCallback, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import http from "@/service/http";
import { trataErroAxios } from "@/utils/trataErroAxios";
import { validatePassword, validatePasswordConfirmation } from "@/utils/validation";

type NewPasswordData = {
  password: string;
  confirmPassword: string;
};

type NewPasswordLocationState = {
  resetToken?: string;
};

export function useNewPassword(onSuccess: () => void) {
  const { t } = useTranslation();
  const location = useLocation();
  const resetToken = useMemo(() => {
    const state = location.state as NewPasswordLocationState | null;
    return state?.resetToken ?? "";
  }, [location.state]);
  const { control, handleSubmit } = useForm<NewPasswordData>({ mode: "onSubmit" });
  const [isLoading, setIsLoading] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);

  const handleResetPassword = useCallback(async (data: NewPasswordData) => {
    if (!resetToken) {
      toast.error(t("pages.newPassword.invalidSession"));
      return;
    }

    const toastId = toast.loading(t("pages.newPassword.loading"));
    try {
      setIsLoading(true);
      setIsDisabled(true);

      await http.post("/auth/reset-password", {
        resetToken,
        password: data.password,
      });

      toast.success(t("pages.newPassword.success"), { id: toastId });
      onSuccess();
    } catch (error) {
      toast.error(trataErroAxios(error), { id: toastId });
    } finally {
      setIsLoading(false);
      setIsDisabled(false);
    }
  }, [onSuccess, resetToken, t]);

  const Rules = {
    password: {
      required: t("validation.passwordRequired"),
      validate: (value: string | undefined) => !value || validatePassword(value) || t("validation.passwordInvalid"),
    },
    confirmPassword: {
      required: t("validation.confirmPasswordRequired"),
      validate: (value: string | undefined, formValues: NewPasswordData) =>
        !value ||
        validatePasswordConfirmation(formValues.password, value) ||
        t("validation.confirmPasswordInvalid"),
    },
  };

  return {
    Rules,
    control,
    handleSubmit,
    handleResetPassword,
    isLoading,
    isDisabled,
  };
}
