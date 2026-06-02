import { InputDefault } from "@/components/custom/inputs/InputDefault";
import { ButtonDefault } from "@/components/custom/buttons/ButtonDefault";
import { AuthLayout } from "@/layout/AuthLayout";
import { useForgotPassword } from "@/hooks/useForgotPassword";
import { useFadeNavigate } from "@/hooks/useFadeNavigate";
import { useMountFadeIn } from "@/hooks/useMountFadeIn";
import { useTranslation } from "react-i18next";

const ForgotPasswordPage = () => {
  const { t } = useTranslation();
  const { isExiting, navigateWithFade } = useFadeNavigate();
  const { Rules, control, handleSubmit, handleForgotPassword, isDisabled, isLoading } =
    useForgotPassword((email) => navigateWithFade("/VerificationCode", { state: { email } }));
  const contentClassName = useMountFadeIn({
    className: "flex w-full min-h-[calc(100dvh-7rem)] flex-col justify-center gap-6",
    isExiting,
  });

  return (
    <AuthLayout onBack={() => navigateWithFade("/Login")} isExiting={isExiting} transparent>
      <div className={contentClassName}>
        <div className="w-full">
          <h3 className="text-4xl min-[970px]:text-5xl font-bold text-start">
            {t("pages.forgotPassword.title")}
          </h3>
          <p className="mt-3 text-black/70">{t("pages.forgotPassword.description")}</p>
        </div>

        <form onSubmit={handleSubmit(handleForgotPassword)} className="flex flex-col gap-2 w-full">
          <InputDefault
            name="email"
            placeholder={t("pages.forgotPassword.emailPlaceholder")}
            control={control}
            rules={Rules.email}
            label={t("pages.forgotPassword.emailLabel")}
            type="email"
            mask="email"
          />

          <div className="pt-5">
            <ButtonDefault
              type="submit"
              dataTestid="forgot-password-submit-button"
              disabled={isDisabled}
              isLoading={isLoading}
              color="default"
            >
              {t("pages.forgotPassword.submitButton")}
            </ButtonDefault>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
