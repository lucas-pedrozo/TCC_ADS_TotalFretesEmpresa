import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { validatePassword } from "@/utils/validation";
import { validateEmail } from "@/utils/validation";
import { http } from "@/service/http";
import { trataErroAxios } from "@/utils/trataErroAxios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

interface LoginData {
  email: string;
  password: string;
}

const extractToken = (payload: unknown): string | null => {
  if (typeof payload === "string") {
    return payload;
  }

  if (payload && typeof payload === "object") {
    const data = payload as Record<string, unknown>;
    const candidate = data.token ?? data.accessToken ?? data.authToken;
    return typeof candidate === "string" ? candidate : null;
  }

  return null;
};

export function useLogin() {
  const { control, handleSubmit } = useForm<LoginData>({ mode: "onSubmit" });
  const [isLoading, setIsLoading] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const HandleLogin = useCallback(async (data: LoginData) => {
    try {
      setIsLoading(true);
      setIsDisabled(true);

      if (!data) {
        throw new Error("No data provided");
      }

      const response = await http.post<unknown>("/auth/login", data);
      const token = extractToken(response.data);

      if (!token) {
        throw new Error("Token nao encontrado na resposta de login");
      }

      await login(token);
      navigate("/Home");

    } catch (error) {
      console.log(trataErroAxios(error));
    } finally {
      setIsLoading(false);
      setIsDisabled(false);
    }
  }, [login, navigate]);

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