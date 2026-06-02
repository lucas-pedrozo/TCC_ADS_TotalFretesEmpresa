import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { setPaymentToken } from "@/constants/signupPayment";
import http from "@/service/http";
import { traduzMensagemApi, trataErroAxios } from "@/utils/trataErroAxios";
import { validateEmail } from "@/utils/validation";
import type { NavigateFunction } from "react-router-dom";

type PendingPaymentData = {
  email: string;
};

type PaymentTokenResponse = {
  paymentToken?: string;
  message?: string;
};

export function usePendingPayment(navigate: NavigateFunction) {
  const { t } = useTranslation();
  const { control, handleSubmit } = useForm<PendingPaymentData>({ mode: "onSubmit" });
  const [isLoading, setIsLoading] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);

  const handleRequestPaymentToken = useCallback(async (data: PendingPaymentData) => {
    const toastId = toast.loading(t("pages.pendingPayment.loading"));
    try {
      setIsLoading(true);
      setIsDisabled(true);

      const email = data.email.trim().toLowerCase();
      const response = await http.post<PaymentTokenResponse>("/company/payment-token/request", {
        email,
      });

      const paymentToken = response.data.paymentToken;

      if (!paymentToken) {
        toast.success(
          traduzMensagemApi(response.data?.message) ?? t("pages.pendingPayment.genericSuccess"),
          { id: toastId },
        );
        return;
      }

      setPaymentToken(paymentToken);
      toast.success(t("pages.pendingPayment.tokenIssued"), { id: toastId });
      navigate("/SignUpPayment");
    } catch (error) {
      toast.error(trataErroAxios(error), { id: toastId });
    } finally {
      setIsLoading(false);
      setIsDisabled(false);
    }
  }, [navigate, t]);

  const Rules = {
    email: {
      required: t("validation.emailRequired"),
      validate: (value: string | undefined) =>
        !value || validateEmail(value) || t("validation.emailInvalid"),
    },
  };

  return {
    Rules,
    control,
    handleSubmit,
    handleRequestPaymentToken,
    isLoading,
    isDisabled,
  };
}
