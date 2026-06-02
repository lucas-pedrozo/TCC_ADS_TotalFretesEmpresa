import { CodeInput } from "@/components/custom/inputs/CodeInput";
import { ButtonDefault } from "@/components/custom/buttons/ButtonDefault";
import { AuthLayout } from "@/layout/AuthLayout";
import { useVerificationCode } from "@/hooks/useVerificationCode";
import { useFadeNavigate } from "@/hooks/useFadeNavigate";
import { useMountFadeIn } from "@/hooks/useMountFadeIn";
import { useTranslation } from "react-i18next";

const VerificationCodePage = () => {
  const { t } = useTranslation();
  const { isExiting, navigateWithFade } = useFadeNavigate();
  const {
    Rules,
    control,
    email,
    handleSubmit,
    handleValidateCode,
    handleResendCode,
    isDisabled,
    isLoading,
    isResending,
  } = useVerificationCode((email, resetToken) =>
    navigateWithFade("/NewPassword", { state: { email, resetToken } }),
  );
  const contentClassName = useMountFadeIn({
    className: "flex w-full min-h-[calc(100dvh-7rem)] flex-col justify-center gap-6",
    isExiting,
  });

  return (
    <AuthLayout onBack={() => navigateWithFade("/ForgotPassword")} isExiting={isExiting} transparent>
      <div className={contentClassName}>
        <div className="w-full">
          <h3 className="text-4xl min-[970px]:text-5xl font-bold text-start">
            {t("pages.verificationCode.title")}
          </h3>
          <p className="mt-3 text-black/70">
            {email
              ? t("pages.verificationCode.description", { email })
              : t("pages.verificationCode.emailNotFound")}
          </p>
        </div>

        <form onSubmit={handleSubmit(handleValidateCode)} className="flex flex-col gap-2 w-full">
          <CodeInput
            name="code"
            control={control}
            rules={Rules.code}
            label={t("pages.verificationCode.codeLabel")}
            disabled={isDisabled || !email}
          />

          <div className="flex flex-col gap-3 pt-5">
            <ButtonDefault
              type="submit"
              dataTestid="verification-code-submit-button"
              disabled={isDisabled || !email}
              isLoading={isLoading}
              color="default"
            >
              {t("pages.verificationCode.submitButton")}
            </ButtonDefault>

            <ButtonDefault
              type="button"
              dataTestid="verification-code-resend-button"
              disabled={!email || isResending}
              isLoading={isResending}
              color="primary"
              onClick={handleResendCode}
            >
              {t("pages.verificationCode.resendButton")}
            </ButtonDefault>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
};

export default VerificationCodePage;
