import { Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { HiInformationCircle } from "react-icons/hi";

import { ButtonDefault } from "@/components/custom/buttons/ButtonDefault";
import { InputDefault, INPUT_STYLES } from "@/components/custom/inputs/InputDefault";
import { useFadeNavigate } from "@/hooks/useFadeNavigate";
import { useMountFadeIn } from "@/hooks/useMountFadeIn";
import { useRegisterCompanyPayment } from "@/hooks/useRegisterCompanyPayment";
import { AuthLayout } from "@/layout/AuthLayout";
import { hasPaymentToken } from "@/constants/signupPayment";
import { maskCardExpiry, maskCardNumber } from "@/utils/cardMask";

const SingUpPaymentPage = () => {
  const { t } = useTranslation();
  const { isExiting, navigateWithFade } = useFadeNavigate();
  const { control, Rules, isSubmitting, handleSubmitPayment } =
    useRegisterCompanyPayment(navigateWithFade);

  const contentClassName = useMountFadeIn({
    className:
      "flex w-full min-h-[calc(100dvh-7rem)] py-4 min-[970px]:py-6 flex-col justify-center gap-6",
    isExiting,
  });

  return (
    <AuthLayout
      onBack={() => navigateWithFade(hasPaymentToken() ? "/SignUpPlan" : "/Login")}
      isExiting={isExiting}
      transparent
    >
      <div className={contentClassName}>
        <div className="w-full">
          <h3 className="text-5xl font-bold text-start">{t("pages.singupPayment.title")}</h3>
          <p className="mt-2 pl-2.5 text-base text-black/70">
            {t("pages.singupPayment.subtitle")}
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmitPayment();
          }}
          className="flex w-full flex-col gap-2"
        >
          <div
            role="note"
            className="mb-2 flex gap-2 rounded-lg border border-brand-green/30 bg-brand-green-light px-3 py-2.5 text-sm text-brand-green-dark"
          >
            <HiInformationCircle className="mt-0.5 size-5 shrink-0" aria-hidden />
            <p>{t("pages.singupPayment.illustrativeNotice")}</p>
          </div>

          <InputDefault
            name="cardHolderName"
            control={control}
            rules={Rules.cardHolderName}
            label={t("pages.singupPayment.cardHolderNameLabel")}
            placeholder={t("pages.singupPayment.cardHolderNamePlaceholder")}
            autoComplete="off"
          />

          <Controller
            name="cardNumber"
            control={control}
            rules={Rules.cardNumber}
            render={({ field, fieldState: { error } }) => (
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="signup-card-number"
                  className={error ? INPUT_STYLES.error.label : INPUT_STYLES.default.label}
                >
                  {t("pages.singupPayment.cardNumberLabel")}
                </label>
                <input
                  id="signup-card-number"
                  name={field.name}
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder={t("pages.singupPayment.cardNumberPlaceholder")}
                  value={maskCardNumber(field.value ?? "")}
                  onChange={(event) => field.onChange(maskCardNumber(event.target.value))}
                  onBlur={field.onBlur}
                  ref={field.ref}
                  className={error ? INPUT_STYLES.error.input : INPUT_STYLES.default.input}
                />
                {error && (
                  <span className="pl-2.5 text-sm text-red-500">{error.message}</span>
                )}
              </div>
            )}
          />

          <div className="grid gap-2 sm:grid-cols-2">
            <Controller
              name="cardExpiry"
              control={control}
              rules={Rules.cardExpiry}
              render={({ field, fieldState: { error } }) => (
                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="signup-card-expiry"
                    className={error ? INPUT_STYLES.error.label : INPUT_STYLES.default.label}
                  >
                    {t("pages.singupPayment.cardExpiryLabel")}
                  </label>
                  <input
                    id="signup-card-expiry"
                    name={field.name}
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    placeholder={t("pages.singupPayment.cardExpiryPlaceholder")}
                    value={maskCardExpiry(field.value ?? "")}
                    onChange={(event) => field.onChange(maskCardExpiry(event.target.value))}
                    onBlur={field.onBlur}
                    ref={field.ref}
                    className={error ? INPUT_STYLES.error.input : INPUT_STYLES.default.input}
                  />
                  {error && (
                    <span className="pl-2.5 text-sm text-red-500">{error.message}</span>
                  )}
                </div>
              )}
            />

            <Controller
              name="cardCvv"
              control={control}
              rules={Rules.cardCvv}
              render={({ field, fieldState: { error } }) => (
                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="signup-card-cvv"
                    className={error ? INPUT_STYLES.error.label : INPUT_STYLES.default.label}
                  >
                    {t("pages.singupPayment.cardCvvLabel")}
                  </label>
                  <input
                    id="signup-card-cvv"
                    name={field.name}
                    type="password"
                    inputMode="numeric"
                    autoComplete="off"
                    maxLength={4}
                    placeholder={t("pages.singupPayment.cardCvvPlaceholder")}
                    value={field.value ?? ""}
                    onChange={(event) =>
                      field.onChange(event.target.value.replace(/\D/g, "").slice(0, 4))
                    }
                    onBlur={field.onBlur}
                    ref={field.ref}
                    className={error ? INPUT_STYLES.error.input : INPUT_STYLES.default.input}
                  />
                  {error && (
                    <span className="pl-2.5 text-sm text-red-500">{error.message}</span>
                  )}
                </div>
              )}
            />
          </div>

          <div className="pt-5">
            <ButtonDefault
              type="submit"
              dataTestid="signup-payment-submit-button"
              disabled={isSubmitting}
              isLoading={isSubmitting}
              color="default"
            >
              {t("pages.singupPayment.submitButton")}
            </ButtonDefault>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
};

export default SingUpPaymentPage;
