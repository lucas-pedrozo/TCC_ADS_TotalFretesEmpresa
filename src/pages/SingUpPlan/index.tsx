import { HiInformationCircle } from "react-icons/hi";
import { useTranslation } from "react-i18next";

import { ButtonDefault } from "@/components/custom/buttons/ButtonDefault";
import { useFadeNavigate } from "@/hooks/useFadeNavigate";
import { useMountFadeIn } from "@/hooks/useMountFadeIn";
import { useSignUpPlan, type SignUpPlanId } from "@/hooks/useSignUpPlan";
import { AuthLayout } from "@/layout/AuthLayout";
import { cn } from "@/lib/utils";

const SingUpPlanPage = () => {
  const { t } = useTranslation();
  const { isExiting, navigateWithFade } = useFadeNavigate();
  const { plans, selectedPlanId, setSelectedPlanId, handleContinue, canContinue } =
    useSignUpPlan(navigateWithFade);

  const contentClassName = useMountFadeIn({
    className:
      "flex w-full min-h-[calc(100dvh-7rem)] py-4 min-[970px]:py-6 flex-col justify-center gap-6",
    isExiting,
  });

  return (
    <AuthLayout onBack={() => navigateWithFade("/Login")} isExiting={isExiting} transparent>
      <div className={contentClassName}>
        <div className="w-full">
          <h3 className="text-5xl font-bold text-start">{t("pages.singupPlan.title")}</h3>
          <p className="mt-2 pl-2.5 text-base text-black/70">{t("pages.singupPlan.subtitle")}</p>
        </div>

        <div
          role="note"
          className="flex gap-2 rounded-lg border border-brand-green/30 bg-brand-green-light px-3 py-2.5 text-sm text-brand-green-dark"
        >
          <HiInformationCircle className="mt-0.5 size-5 shrink-0" aria-hidden />
          <p>{t("pages.singupPlan.illustrativeNotice")}</p>
        </div>

        <div className="grid w-full gap-3 sm:grid-cols-3">
          {plans.map((plan) => {
            const isSelected = selectedPlanId === plan.id;

            return (
              <button
                key={plan.id}
                type="button"
                data-testid={`signup-plan-${plan.id}`}
                onClick={() => setSelectedPlanId(plan.id as SignUpPlanId)}
                className={cn(
                  "flex flex-col gap-3 rounded-lg border bg-white p-4 text-left transition-all",
                  "hover:border-brand-green/60 hover:shadow-sm",
                  isSelected
                    ? "border-brand-green ring-2 ring-brand-green/40"
                    : "border-black/30",
                )}
              >
                <div>
                  <p className="text-lg font-bold text-black">{plan.name}</p>
                  <p className="mt-1 text-2xl font-bold text-brand-green-dark">{plan.price}</p>
                </div>
                <ul className="flex flex-col gap-1.5 text-sm text-black/80">
                  {plan.features.map((feature) => (
                    <li key={feature} className="pl-1">
                      • {feature}
                    </li>
                  ))}
                </ul>
              </button>
            );
          })}
        </div>

        {!canContinue && (
          <p className="pl-2.5 text-sm text-black/60">{t("pages.singupPlan.selectPlanHint")}</p>
        )}

        <div className="pt-2">
          <ButtonDefault
            type="button"
            dataTestid="signup-plan-continue-button"
            disabled={!canContinue}
            color="default"
            onClick={handleContinue}
          >
            {t("pages.singupPlan.continueButton")}
          </ButtonDefault>
        </div>
      </div>
    </AuthLayout>
  );
};

export default SingUpPlanPage;
