import { useCallback, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import http from "@/service/http";
import { traduzMensagemApi, trataErroAxios } from "@/utils/trataErroAxios";
import { validateCode } from "@/utils/validation";

type VerificationCodeData = {
  code: string;
};

type VerificationLocationState = {
  email?: string;
};

type ValidateCodeResponse = {
  resetToken?: string;
};

export function useVerificationCode(onSuccess: (email: string, resetToken: string) => void) {
  const { t } = useTranslation();
  const location = useLocation();
  const email = useMemo(() => {
    const state = location.state as VerificationLocationState | null;
    return state?.email ?? "";
  }, [location.state]);
  const { control, handleSubmit } = useForm<VerificationCodeData>({ mode: "onSubmit" });
  const [isLoading, setIsLoading] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const handleValidateCode = useCallback(async (data: VerificationCodeData) => {
    if (!email) {
      toast.error(t("pages.verificationCode.emailNotFound"));
      return;
    }

    const toastId = toast.loading(t("pages.verificationCode.loading"));
    try {
      setIsLoading(true);
      setIsDisabled(true);

      const response = await http.post<ValidateCodeResponse>("/auth/validate-code", {
        email,
        code: data.code,
      });
      const resetToken = response.data.resetToken;

      if (!resetToken) {
        throw new Error(t("pages.verificationCode.invalidResponse"));
      }

      toast.success(t("pages.verificationCode.success"), { id: toastId });
      onSuccess(email, resetToken);
    } catch (error) {
      toast.error(trataErroAxios(error), { id: toastId });
    } finally {
      setIsLoading(false);
      setIsDisabled(false);
    }
  }, [email, onSuccess, t]);

  const handleResendCode = useCallback(async () => {
    if (!email) {
      toast.error(t("pages.verificationCode.emailNotFound"));
      return;
    }

    const toastId = toast.loading(t("pages.verificationCode.resendLoading"));
    try {
      setIsResending(true);
      const response = await http.post("/auth/resend-code", { email });
      toast.success(
        traduzMensagemApi(response.data?.message) ?? t("pages.verificationCode.resendSuccess"),
        { id: toastId },
      );
    } catch (error) {
      toast.error(trataErroAxios(error), { id: toastId });
    } finally {
      setIsResending(false);
    }
  }, [email, t]);

  const Rules = {
    code: {
      required: t("validation.codeRequired"),
      validate: (value: string | undefined) => !value || validateCode(value) || t("validation.codeInvalid"),
    },
  };

  return {
    Rules,
    control,
    email,
    handleSubmit,
    handleValidateCode,
    handleResendCode,
    isLoading,
    isDisabled,
    isResending,
  };
}
