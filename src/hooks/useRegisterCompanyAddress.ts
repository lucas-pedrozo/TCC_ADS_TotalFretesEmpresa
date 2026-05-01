import { useCallback } from "react";
import { useForm } from "react-hook-form";
import { useRegisterCompanyContext, type RegisterCompanyDataAddress } from "@/context/RegisterCompanyContext";
import { trataErroAxios } from "@/utils/trataErroAxios";

export function useRegisterCompanyAddress(onClickNext: () => void) {
  const { addressData, setDataAddress } = useRegisterCompanyContext();
  const { control, handleSubmit, formState: { errors } } =
    useForm<RegisterCompanyDataAddress>({ mode: "onSubmit", defaultValues: addressData });

  const handleNextCompanyAddress = useCallback(() => {
    try {
      handleSubmit((data) => {
        setDataAddress(data);
        onClickNext();
      })();
    } catch (error) {
      console.log(trataErroAxios(error));
    }
  }, [handleSubmit, setDataAddress, onClickNext]);

  const Rules = {
    cep: {
      required: "CEP is required",
    },
    street: {
      required: "Street is required",
    },
    district: {
      required: "District is required",
    },
    number: {
      required: "Number is required",
    },
    city: {
      required: "City is required",
    },
    state: {
      required: "State is required",
    },
  };

  return {
    Rules,
    control,
    errors,
    handleSubmit,
    handleNextCompanyAddress,
  };
}