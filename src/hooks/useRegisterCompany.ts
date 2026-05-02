import { useCallback, useState } from "react";
import http from "@/service/http";
import { trataErroAxios } from "@/utils/trataErroAxios";
import { useRegisterCompanyContext } from "@/context/RegisterCompanyContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export function useRegisterCompany() {
  const { getPayload, reset } = useRegisterCompanyContext();
  const [isLoading, setIsLoading] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const navigate = useNavigate();

  const handleRegisterCompany = useCallback(async () => {
    const toastId = toast.loading("Criando conta...");
    try {
      setIsLoading(true);
      setIsDisabled(true);

      const data = getPayload();
      await http.post("/company/register", data);

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