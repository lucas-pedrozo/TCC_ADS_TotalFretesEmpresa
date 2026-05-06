import { useCallback } from "react";
import { useForm } from "react-hook-form";
import { useRegisterCompanyContext, type RegisterCompanyDataAddress, type RegisterCompanyDraftData, ACCOUNT_TYPE_COMPANY } from "@/context/RegisterCompanyContext";
import { trataErroAxios } from "@/utils/trataErroAxios";
import { toast } from "sonner";

export function useRegisterCompanyAddress(
  onRegister: (payload: RegisterCompanyDraftData) => void | Promise<void>
) {
  const { basicData, addressData, setDataAddress } = useRegisterCompanyContext();
  const { control, handleSubmit, formState: { errors } } =
    useForm<RegisterCompanyDataAddress>({ mode: "onSubmit", defaultValues: addressData });

  const handleNextCompanyAddress = useCallback(() => {
    try {
      handleSubmit((data) => {
        setDataAddress(data);
        void onRegister({ ...basicData, ...data, account_type_id: ACCOUNT_TYPE_COMPANY });
      })();
    } catch (error) {
      toast.error(trataErroAxios(error));
    }
  }, [handleSubmit, setDataAddress, onRegister, basicData]);

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