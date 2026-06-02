import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { validatePassword } from "@/utils/validation";
import { validateEmail } from "@/utils/validation";
import http from "@/service/http";
import { trataErroAxios } from "@/utils/trataErroAxios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { AUTH_REDIRECT_DELAY_MS } from "@/utils/ui";

interface LoginData {
  email: string;
  password: string;
}

export type UseLoginOptions = {
  /** Após o toast de sucesso e o delay, chame ex. `() => navigateWithFade('/Home')`. */
  navigateToHome?: () => void;
  /** Padrão: {@link AUTH_REDIRECT_DELAY_MS}. */
  successDelayMs?: number;
};

export function useLogin(options?: UseLoginOptions) {
  const { control, handleSubmit } = useForm<LoginData>({ mode: "onSubmit" });
  const [isLoading, setIsLoading] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useTranslation();
  const delayMs = options?.successDelayMs ?? AUTH_REDIRECT_DELAY_MS;
  const goHome = options?.navigateToHome ?? (() => navigate("/Home"));

  const HandleLogin = useCallback(async (data: LoginData) => {
    if (!navigator.onLine) {
      toast.error(t("errors.offline"));
      return;
    }

    const toastId = toast.loading(t("pages.login.loading"));
    let reenableForm = true;
    try {
      setIsLoading(true);
      setIsDisabled(true);

      if (!data) {
        throw new Error(t('pages.login.noDataProvided'));
      }

      const response = await http.post("/auth/login", {
        email: data.email.trim().toLowerCase(),
        password: data.password,
      });
      const token = response.data.token;

      if (!token) {
        throw new Error(t('pages.login.tokenNotFound'));
      }

      await login(token);
      toast.success(t("pages.login.success"), {
        id: toastId,
        duration: delayMs,
      });
      setIsLoading(false);
      reenableForm = false;
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      goHome();
    } catch (error) {
      toast.error(trataErroAxios(error), { id: toastId });
    } finally {
      setIsLoading(false);
      if (reenableForm) setIsDisabled(false);
    }
  }, [login, goHome, t, delayMs]);

  const Rules = {
    email: {
      required: t('pages.login.emailRequired'),
      validate: (value: string) => validateEmail(value) || t("validation.emailInvalid")
    },
    password: {
      required: t('pages.login.passwordRequired'),
      validate: (value: string) => validatePassword(value) || t("validation.passwordInvalid")
    },
  };

  return {
    Rules,
    HandleLogin,
    control,
    handleSubmit,
    isLoading,
    isDisabled
  };
}