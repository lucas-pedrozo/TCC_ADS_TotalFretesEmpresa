import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { validatePassword } from "@/utils/validation";
import { validateEmail } from "@/utils/validation";
import { http } from "@/service/http";
import { trataErroAxios } from "@/utils/trataErroAxios";

interface LoginData {
  email: string;
  password: string;
}

export function useLogin() {
  const { control, handleSubmit } = useForm<LoginData>({ mode: "onSubmit" });
  const [isLoading, setIsLoading] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);

  const HandleLogin = useCallback(async (data: LoginData) => {
    try {
      setIsLoading(true);
      setIsDisabled(true);

      if (!data) {
        throw new Error("No data provided");
      }

      const response = await http.post<LoginData>("/auth/login", data);
      const token = response.data;
      console.log(token);

    } catch (error) {
      trataErroAxios(error);
    } finally {
      setIsLoading(false);
      setIsDisabled(false);
    }
  }, []);

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