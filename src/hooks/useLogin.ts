import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { validatePassword } from "@/utils/validation";
import { validateEmail } from "@/utils/validation";
import http from "@/service/http";
import { trataErroAxios } from "@/utils/trataErroAxios";
import { useNavigate, type NavigateFunction } from "react-router-dom";
import { getApiErrorCode } from "@/utils/apiError";
import { useAuth } from "@/context/AuthContext";
import { decodeToken } from "@/context/AuthContext";
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
  /** Quando o usuário é ADMIN. */
  navigateToAdmin?: () => void;
  /** Quando o pagamento da empresa ainda não foi concluído. */
  navigateToPendingPayment?: NavigateFunction;
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
  const goAdmin = options?.navigateToAdmin ?? (() => navigate("/admin"));
  const goPendingPayment =
    options?.navigateToPendingPayment ?? (() => navigate("/PendingPayment"));

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
      const decoded = decodeToken(token);
      const role = decoded?.role ?? decoded?.accessLevel;
      if (role?.toUpperCase() === "ADMIN") {
        goAdmin();
      } else {
        goHome();
      }
    } catch (error) {
      if (getApiErrorCode(error) === "PAYMENT_PENDING") {
        toast.error(t("AUTH.PAYMENT_PENDING"), { id: toastId });
        setIsLoading(false);
        reenableForm = false;
        setIsDisabled(false);
        goPendingPayment("/PendingPayment");
        return;
      }
      toast.error(trataErroAxios(error), { id: toastId });
    } finally {
      setIsLoading(false);
      if (reenableForm) setIsDisabled(false);
    }
  }, [login, goHome, goAdmin, goPendingPayment, t, delayMs]);

  const Rules = {
    email: {
      required: t('pages.login.emailRequired'),
      validate: (value: string) => validateEmail(value) || t("validation.emailInvalid")
    },
    password: {
      required: t('pages.login.passwordRequired'),
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