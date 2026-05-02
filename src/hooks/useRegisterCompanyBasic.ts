
import { useRegisterCompanyContext, type RegisterCompanyDataBasic } from "@/context/RegisterCompanyContext";
import { trataErroAxios } from "@/utils/trataErroAxios";
import { validateCNPJ, validateCPF, validateEmail, validatePassword } from "@/utils/validation";
import { useCallback } from "react"
import { useForm } from "react-hook-form";

export function useRegisterCompanyBasic(onClickNext: () => void) {
  const { basicData, setDataBasic } = useRegisterCompanyContext();
  const { control, handleSubmit, formState: { errors } } =
    useForm<RegisterCompanyDataBasic>({ mode: "onSubmit", defaultValues: basicData });

  const handleNextCompanyBasic = useCallback(() => {
    try {
      handleSubmit((data) => {
        setDataBasic(data);
        onClickNext();
      })();
    } catch (error) {
      console.log(trataErroAxios(error));
    }
  }, [handleSubmit, setDataBasic, onClickNext])

  const Rules = {
    email: {
      required: "Email is required",
      validate: (value: string | undefined) => !value || validateEmail(value) || "Invalid email format"
    },
    name: {
      required: "Name is required",
      validate: (value: string | undefined) => !value || value.length >= 3 || "Name must be at least 3 characters"
    },
    birthFundation: {
      required: "Birth/Founding date is required",  
    },
    phoneNumber: {
      required: "Phone number is required",
    },
    cpf: {
      required: "CPF is required",
      validate: (value: string | undefined) => !value || validateCPF(value) || "Invalid CPF format"
    },
    cnpj: {
      required: "CNPJ is required",
      validate: (value: string | undefined) => !value || validateCNPJ(value) || "Invalid CNPJ format"
    },
    password: {
      required: "Password is required",
      validate: (value: string | undefined) => !value || validatePassword(value) || "Password must be at least 8 characters",
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