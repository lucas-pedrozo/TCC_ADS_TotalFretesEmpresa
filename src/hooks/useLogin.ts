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

interface LoginData {
  email: string;
  password: string;
}

export function useLogin() {
  const { control, handleSubmit } = useForm<LoginData>({ mode: "onSubmit" });
  const [isLoading, setIsLoading] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useTranslation();

  const HandleLogin = useCallback(async (data: LoginData) => {
    const toastId = toast.loading(t("pages.login.loading"));
    try {
      setIsLoading(true);
      setIsDisabled(true);

      if (!data) {
        throw new Error("No data provided");
      }

      const response = await http.post("/auth/login", data);
      const token = response.data.token;

      if (!token) {
        throw new Error("Token nao encontrado na resposta de login");
      }

      await login(token);
      toast.success(t("pages.login.success"), { id: toastId });
      navigate("/Home");

    } catch (error) {
      toast.error(trataErroAxios(error), { id: toastId });
    } finally {
      setIsLoading(false);
      setIsDisabled(false);
    }
  }, [login, navigate, t]);

  const Rules = {
    email: {
      required: "Email is required",
      validate: (value: string) => validateEmail(value)
    },
    password: {
      required: "Password is required",
      validate: (value: string) => validatePassword(value)
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