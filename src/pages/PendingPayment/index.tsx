import { InputDefault } from "@/components/custom/inputs/InputDefault";
import { ButtonDefault } from "@/components/custom/buttons/ButtonDefault";
import { AuthLayout } from "@/layout/AuthLayout";
import { useFadeNavigate } from "@/hooks/useFadeNavigate";
import { useMountFadeIn } from "@/hooks/useMountFadeIn";
import { usePendingPayment } from "@/hooks/usePendingPayment";
import { useTranslation } from "react-i18next";

const PendingPaymentPage = () => {
  const { t } = useTranslation();
  const { isExiting, navigateWithFade } = useFadeNavigate();
  const { Rules, control, handleSubmit, handleRequestPaymentToken, isDisabled, isLoading } =
    usePendingPayment(navigateWithFade);

  const contentClassName = useMountFadeIn({
    className:
      "flex w-full min-h-[calc(100dvh-7rem)] py-4 min-[970px]:py-6 flex-col justify-center gap-6",
    isExiting,
  });

  return (
    <AuthLayout onBack={() => navigateWithFade("/Login")} isExiting={isExiting} transparent>
      <div className={contentClassName}>
        <div className="w-full">
          <h3 className="text-5xl font-bold text-start">{t("pages.pendingPayment.title")}</h3>
          <p className="mt-2 pl-2.5 text-base text-black/70">
            {t("pages.pendingPayment.subtitle")}
          </p>
        </div>

        <form
          onSubmit={handleSubmit(handleRequestPaymentToken)}
          className="flex w-full flex-col gap-2"
        >
          <InputDefault
            name="email"
            placeholder={t("pages.pendingPayment.emailPlaceholder")}
            control={control}
            rules={Rules.email}
            label={t("pages.pendingPayment.emailLabel")}
            type="email"
            mask="email"
          />

          <div className="pt-5">
            <ButtonDefault
              type="submit"
              dataTestid="pending-payment-submit-button"
              disabled={isDisabled}
              isLoading={isLoading}
              color="default"
            >
              {t("pages.pendingPayment.submitButton")}
            </ButtonDefault>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
};

export default PendingPaymentPage;
