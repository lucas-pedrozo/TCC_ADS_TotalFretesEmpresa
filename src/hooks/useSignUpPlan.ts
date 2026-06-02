import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, type NavigateFunction } from "react-router-dom";

import { hasPaymentToken } from "@/constants/signupPayment";

export type SignUpPlanId = "basic" | "professional" | "enterprise";

const PLAN_IDS: SignUpPlanId[] = ["basic", "professional", "enterprise"];

export function useSignUpPlan(navigateOverride?: NavigateFunction) {
  const { t } = useTranslation();
  const navigateDefault = useNavigate();
  const navigate = navigateOverride ?? navigateDefault;
  const [selectedPlanId, setSelectedPlanId] = useState<SignUpPlanId | null>(null);

  useEffect(() => {
    if (!hasPaymentToken()) {
      navigate("/PendingPayment", { replace: true });
    }
  }, [navigate]);

  const plans = useMemo(
    () =>
      PLAN_IDS.map((id) => ({
        id,
        name: t(`pages.singupPlan.plans.${id}.name`),
        price: t(`pages.singupPlan.plans.${id}.price`),
        features: [
          t(`pages.singupPlan.plans.${id}.feature1`),
          t(`pages.singupPlan.plans.${id}.feature2`),
          t(`pages.singupPlan.plans.${id}.feature3`),
        ],
      })),
    [t],
  );

  const handleContinue = () => {
    if (!selectedPlanId) return;
    navigate("/SignUpPayment");
  };

  return {
    plans,
    selectedPlanId,
    setSelectedPlanId,
    handleContinue,
    canContinue: selectedPlanId !== null,
  };
}
