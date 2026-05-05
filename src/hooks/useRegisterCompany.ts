import { useCallback, useState } from "react";
import http from "@/service/http";
import { trataErroAxios } from "@/utils/trataErroAxios";
import { useRegisterCompanyContext, type RegisterCompanyDraftData } from "@/context/RegisterCompanyContext";
import { useNavigate, type NavigateFunction } from "react-router-dom";
import { toast } from "sonner";

export function useRegisterCompany(navigateOverride?: NavigateFunction) {
  const { getPayload, reset } = useRegisterCompanyContext();
  const [isLoading, setIsLoading] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const navigateDefault = useNavigate();
  const navigate = navigateOverride ?? navigateDefault;

  const handleRegisterCompany = useCallback(async (payload?: RegisterCompanyDraftData) => {
    const toastId = toast.loading("Criando conta...");
    try {
      setIsLoading(true);
      setIsDisabled(true);

      const data = payload ?? getPayload();
      await http.post("/company/end-account/", data);

      reset();
      toast.success("Conta criada com sucesso! Faça login para continuar.", { id: toastId });
      navigate("/Login");
    } catch (error) {
      toast.error(trataErroAxios(error), { id: toastId });
    } finally {
      setIsLoading(false);
      setIsDisabled(false);
    }
  }, [getPayload, reset, navigate]);

  return {
    handleRegisterCompany,
    isLoading,
    isDisabled,
  };
}