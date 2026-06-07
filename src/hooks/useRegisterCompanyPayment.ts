import { useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate, type NavigateFunction } from "react-router-dom";
import { toast } from "sonner";

import {
  clearPaymentToken,
  getPaymentToken,
  hasPaymentToken,
} from "@/constants/signupPayment";
import http from "@/service/http";
import { trataErroAxios } from "@/utils/trataErroAxios";
import { digitsOnly } from "@/utils/cardMask";

export type RegisterCompanyPaymentData = {
  cardHolderName: string;
  cardNumber: string;
  cardExpiry: string;
  cardCvv: string;
};

const CARD_EXPIRY_REGEX = /^(0[1-9]|1[0-2])\/\d{2}$/;

const defaultValues: RegisterCompanyPaymentData = {
  cardHolderName: "",
  cardNumber: "",
  cardExpiry: "",
  cardCvv: "",
};

export function useRegisterCompanyPayment(navigateOverride?: NavigateFunction) {
  const { t } = useTranslation();
  const navigateDefault = useNavigate();
  const navigate = navigateOverride ?? navigateDefault;

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterCompanyPaymentData>({
    mode: "onSubmit",
    defaultValues,
  });

  useEffect(() => {
    if (!hasPaymentToken()) {
      navigate("/PendingPayment", { replace: true });
    }
  }, [navigate]);

  const Rules = {
    cardHolderName: {
      required: t("validation.cardHolderNameRequired"),
      validate: (value: string | undefined) => {
        const trimmed = value?.trim() ?? "";
        if (!trimmed) return t("validation.cardHolderNameRequired");
        if (trimmed.length < 3) return t("validation.cardHolderNameInvalid");
        return true;
      },
    },
    cardNumber: {
      required: t("validation.cardNumberRequired"),
      validate: (value: string | undefined) => {
        const digits = digitsOnly(value ?? "");
        if (!digits) return t("validation.cardNumberRequired");
        if (digits.length < 13 || digits.length > 19) return t("validation.cardNumberInvalid");
        return true;
      },
    },
    cardExpiry: {
      required: t("validation.cardExpiryRequired"),
      validate: (value: string | undefined) => {
        if (!value?.trim()) return t("validation.cardExpiryRequired");
        if (!CARD_EXPIRY_REGEX.test(value.trim())) return t("validation.cardExpiryInvalid");
        return true;
      },
    },
    cardCvv: {
      required: t("validation.cardCvvRequired"),
      validate: (value: string | undefined) => {
        const digits = digitsOnly(value ?? "");
        if (!digits) return t("validation.cardCvvRequired");
        if (digits.length < 3 || digits.length > 4) return t("validation.cardCvvInvalid");
        return true;
      },
    },
  };

  const handleSubmitPayment = useCallback(() => {
    handleSubmit(async () => {
      const paymentToken = getPaymentToken();

      if (!paymentToken) {
        navigate("/PendingPayment", { replace: true });
        return;
      }

      const toastId = toast.loading(t("pages.singupPayment.submitting"));
      try {
        await http.patch(
          "/company/complete-payment",
          {},
          {
            headers: {
              Authorization: `Bearer ${paymentToken}`,
            },
          },
        );

        clearPaymentToken();
        toast.success(t("register.completed"), { id: toastId });
        navigate("/Login");
      } catch (error) {
        toast.error(trataErroAxios(error), { id: toastId });
      }
    })();
  }, [handleSubmit, navigate, t]);

  return {
    control,
    errors,
    Rules,
    isSubmitting,
    handleSubmitPayment,
  };
}
