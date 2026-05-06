import { useCallback, useState } from "react";
import http from "@/service/http";
import { trataErroAxios } from "@/utils/trataErroAxios";
import { useRegisterCompanyContext, type RegisterCompanyDraftData } from "@/context/RegisterCompanyContext";
import { useNavigate, type NavigateFunction } from "react-router-dom";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

export function useRegisterCompany(navigateOverride?: NavigateFunction) {
  const { getPayload, reset } = useRegisterCompanyContext();
  const [isLoading, setIsLoading] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const navigateDefault = useNavigate();
  const navigate = navigateOverride ?? navigateDefault;
  const { t } = useTranslation();

  const handleRegisterCompany = useCallback(async (payload?: RegisterCompanyDraftData) => {
    const toastId = toast.loading(t("register.loading"));
    try {
      setIsLoading(true);
      setIsDisabled(true);

      const data = payload ?? getPayload();
      await http.post("/company/end-account/", data);

      reset();
      toast.success(t("register.success"), { id: toastId });
      navigate("/Login");
    } catch (error) {
      toast.error(trataErroAxios(error), { id: toastId });
    } finally {
      setIsLoading(false);
      setIsDisabled(false);
    }
  }, [getPayload, reset, navigate, t]);

  return {
    handleRegisterCompany,
    isLoading,
    isDisabled,
  };
}