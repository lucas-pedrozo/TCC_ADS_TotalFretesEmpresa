import { useCallback, useState } from "react"
import { http } from "@/service/http";
import { trataErroAxios } from "@/utils/trataErroAxios";
import { useForm } from "react-hook-form";
import { validateEmail } from "@/utils/validation";

// revalidar esse metodo pois deve ser feito port um context porque é um cadatro de 2 etapas, dados basicoa da empresa e endereto da empresa
interface RegisterCompanyData {
  name: string;
  birthFundation: string;
  phoneNumber: string;
  website?: string;
  cnpj: string;
  email: string;
  password: string;

  cep: string;
  street: string;
  district: string;
  number: string;
  city: string;
  state: string;
}

export function useRegisterCompany() {
  const { control, handleSubmit } = useForm<RegisterCompanyData>({ mode: "onSubmit" });
  const [isLoading, setIsLoading] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);

  const handleRegisterCompany = useCallback(async (data: RegisterCompanyData) => {
    try {
      setIsLoading(true);
      setIsDisabled(true);
      if(!data) {
        throw new Error("No data provided");
      }
      await http.post<RegisterCompanyData>("/company/register", { data });
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
    }
  }

  return {
    Rules,
    control,
    handleSubmit,
    handleRegisterCompany,
    isLoading,
    isDisabled
  }
}