import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { InputDefault } from "@/components/custom/inputs/InputDefault";
import { ButtonDefault } from "@/components/custom/buttons/ButtonDefault";
import { AuthLayout } from "@/layout/AuthLayout";
import { useNewPassword } from "@/hooks/useNewPassword";
import { useFadeNavigate } from "@/hooks/useFadeNavigate";
import { useMountFadeIn } from "@/hooks/useMountFadeIn";
import { useTranslation } from "react-i18next";

const NewPasswordPage = () => {
  const { t } = useTranslation();
  const { isExiting, navigateWithFade } = useFadeNavigate();
  const { Rules, control, handleSubmit, handleResetPassword, isDisabled, isLoading } =
    useNewPassword(() => navigateWithFade("/Login"));
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const contentClassName = useMountFadeIn({
    className: "flex w-full min-h-[calc(100dvh-7rem)] flex-col justify-center gap-6",
    isExiting,
  });

  return (
    <AuthLayout onBack={() => navigateWithFade("/VerificationCode")} isExiting={isExiting} transparent>
      <div className={contentClassName}>
        <div className="w-full">
          <h3 className="text-4xl min-[970px]:text-5xl font-bold text-start">
            {t("pages.newPassword.title")}
          </h3>
          <p className="mt-3 text-black/70">{t("pages.newPassword.description")}</p>
        </div>

        <form onSubmit={handleSubmit(handleResetPassword)} className="flex flex-col gap-2 w-full">
          <InputDefault
            name="password"
            placeholder={t("pages.newPassword.passwordPlaceholder")}
            control={control}
            rules={Rules.password}
            label={t("pages.newPassword.passwordLabel")}
            type={showPassword ? "text" : "password"}
            rightElement={
              <button
                type="button"
                aria-label={showPassword ? t("common.hidePassword") : t("common.showPassword")}
                onClick={() => setShowPassword((current) => !current)}
                className="text-black/70 hover:text-black cursor-pointer"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            }
          />

          <InputDefault
            name="confirmPassword"
            placeholder={t("pages.newPassword.confirmPasswordPlaceholder")}
            control={control}
            rules={Rules.confirmPassword}
            label={t("pages.newPassword.confirmPasswordLabel")}
            type={showConfirmPassword ? "text" : "password"}
            rightElement={
              <button
                type="button"
                aria-label={showConfirmPassword ? t("common.hidePassword") : t("common.showPassword")}
                onClick={() => setShowConfirmPassword((current) => !current)}
                className="text-black/70 hover:text-black cursor-pointer"
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            }
          />

          <div className="pt-5">
            <ButtonDefault
              type="submit"
              dataTestid="new-password-submit-button"
              disabled={isDisabled}
              isLoading={isLoading}
              color="default"
            >
              {t("pages.newPassword.submitButton")}
            </ButtonDefault>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
};

export default NewPasswordPage;
