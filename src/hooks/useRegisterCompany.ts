import { useCallback, useState } from "react";
import http from "@/service/http";
import { trataErroAxios } from "@/utils/trataErroAxios";
import { useRegisterCompanyContext } from "@/context/RegisterCompanyContext";
import { useNavigate } from "react-router-dom";

export function useRegisterCompany() {
  const { getPayload, reset } = useRegisterCompanyContext();
  const [isLoading, setIsLoading] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const navigate = useNavigate();

  const handleRegisterCompany = useCallback(async () => {
    try {
      setIsLoading(true);
      setIsDisabled(true);

      const data = getPayload();
      await http.post("/company/register", data);

      reset();
      navigate("/Home"); 
    } catch (error) {
      console.log(trataErroAxios(error));
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