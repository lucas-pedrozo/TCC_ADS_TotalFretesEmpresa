import { DatePickerInput } from '@/components/custom/inputs/DatePickerInput'
import { InputDefault } from '@/components/custom/inputs/InputDefault'
import { INPUT_STYLES } from '@/components/custom/inputs/InputDefault'
import { ButtonDefault } from '@/components/custom/buttons/ButtonDefault'
import { AuthLayout } from '@/layout/AuthLayout'
import { useRegisterCompanyBasic } from '@/hooks/useRegisterCompanyBasic'
import { useFadeNavigate } from '@/hooks/useFadeNavigate'
import { useMountFadeIn } from '@/hooks/useMountFadeIn'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Controller, useWatch } from 'react-hook-form'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import {
    formatPhoneCountryCode,
    maskPhoneNationalNumber,
    normalizePhoneCountryCodeInput,
    normalizePhoneNationalNumberInput,
} from '@/utils/phone'

const SingUpBasicPage = () => {
    const { t } = useTranslation()
    const { isExiting, navigateWithFade } = useFadeNavigate()
    const { Rules, control, handleNextCompanyBasic } = useRegisterCompanyBasic(() =>
        navigateWithFade('/SignUpAddress'),
    )
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const phoneCountryCode = useWatch({ control, name: 'phoneCountryCode' })
    const contentClassName = useMountFadeIn({
        className: 'flex w-full min-h-[calc(100dvh-7rem)] py-4 min-[970px]:py-6 flex-col justify-center gap-6',
        isExiting,
    })

    return (
        <AuthLayout onBack={() => navigateWithFade('/')} isExiting={isExiting} transparent>
            <div className={contentClassName}>
                <div className="w-full">
                    <h3 className="text-3xl sm:text-4xl min-[970px]:text-5xl font-bold text-start leading-tight">
                        {t('pages.singupBasic.title')}
                    </h3>
                </div>

                <form
                    onSubmit={(e) => {
                        e.preventDefault()
                        handleNextCompanyBasic()
                    }}
                    className="flex flex-col gap-2 w-full"
                >
                    <InputDefault
                        name="name"
                        placeholder={t('pages.singupBasic.namePlaceholder')}
                        control={control}
                        rules={Rules.name}
                        label={t('pages.singupBasic.nameLabel')}
                    />

                    <InputDefault
                        name="email"
                        placeholder={t('pages.singupBasic.emailPlaceholder')}
                        control={control}
                        rules={Rules.email}
                        label={t('pages.singupBasic.emailLabel')}
                        type="email"
                        mask="email"
                    />

                    <InputDefault
                        name="cnpj"
                        placeholder={t('pages.singupBasic.cnpjPlaceholder')}
                        control={control}
                        rules={Rules.cnpj}
                        label={t('pages.singupBasic.cnpjLabel')}
                        mask="cnpj"
                        maxLength={18}
                    />

                    <div className="grid gap-3 md:items-end md:grid-cols-[140px_minmax(0,1fr)]">
                        <Controller
                            name="phoneCountryCode"
                            control={control}
                            rules={Rules.phoneCountryCode}
                            render={({ field, fieldState: { error } }) => (
                                <div className="flex flex-col gap-1">
                                    <label
                                        htmlFor="signup-phone-country-code"
                                        className={
                                            error
                                                ? INPUT_STYLES.error.label
                                                : INPUT_STYLES.default.label
                                        }
                                    >
                                        {t('pages.singupBasic.phoneCountryCodeLabel')}
                                    </label>
                                    <input
                                        id="signup-phone-country-code"
                                        name={field.name}
                                        type="text"
                                        inputMode="numeric"
                                        autoComplete="tel-country-code"
                                        placeholder={t('pages.singupBasic.phoneCountryCodePlaceholder')}
                                        value={formatPhoneCountryCode(field.value ?? '')}
                                        onChange={(event) =>
                                            field.onChange(
                                                normalizePhoneCountryCodeInput(event.target.value),
                                            )
                                        }
                                        onBlur={field.onBlur}
                                        ref={field.ref}
                                        maxLength={4}
                                        className={
                                            error
                                                ? INPUT_STYLES.error.input
                                                : INPUT_STYLES.default.input
                                        }
                                    />
                                    {error && (
                                        <span className="pl-2.5 text-red-500 text-sm">
                                            {error.message}
                                        </span>
                                    )}
                                </div>
                            )}
                        />

                        <Controller
                            name="phoneNumber"
                            control={control}
                            rules={Rules.phoneNumber}
                            render={({ field, fieldState: { error } }) => (
                                <div className="flex flex-col gap-1">
                                    <label
                                        htmlFor="signup-phone-number"
                                        className={
                                            error
                                                ? INPUT_STYLES.error.label
                                                : INPUT_STYLES.default.label
                                        }
                                    >
                                        {t('pages.singupBasic.phoneNumberLabel')}
                                    </label>
                                    <input
                                        id="signup-phone-number"
                                        name={field.name}
                                        type="text"
                                        inputMode="tel"
                                        autoComplete="tel-national"
                                        placeholder={t('pages.singupBasic.phoneNumberPlaceholder')}
                                        value={maskPhoneNationalNumber(
                                            field.value ?? '',
                                            phoneCountryCode ?? '',
                                        )}
                                        onChange={(event) =>
                                            field.onChange(
                                                normalizePhoneNationalNumberInput(
                                                    event.target.value,
                                                    phoneCountryCode ?? '',
                                                ),
                                            )
                                        }
                                        onBlur={field.onBlur}
                                        ref={field.ref}
                                        maxLength={20}
                                        className={
                                            error
                                                ? INPUT_STYLES.error.input
                                                : INPUT_STYLES.default.input
                                        }
                                    />
                                    {error && (
                                        <span className="pl-2.5 text-red-500 text-sm">
                                            {error.message}
                                        </span>
                                    )}
                                </div>
                            )}
                        />
                    </div>

                    <Controller
                        name="birthFundation"
                        control={control}
                        rules={Rules.birthFundation}
                        render={({ field, fieldState: { error } }) => (
                            <div className="flex flex-col gap-1">
                                <label
                                    htmlFor="signup-birth-fundation"
                                    className={
                                        error ? INPUT_STYLES.error.label : INPUT_STYLES.default.label
                                    }
                                >
                                    {t('pages.singupBasic.birthFundationLabel')}
                                </label>

                                <DatePickerInput
                                    id="signup-birth-fundation"
                                    value={field.value ?? ''}
                                    onChange={field.onChange}
                                    onBlur={field.onBlur}
                                    placeholder={t('pages.singupBasic.birthFundationPlaceholder')}
                                    className={
                                        error
                                            ? INPUT_STYLES.error.input
                                            : INPUT_STYLES.default.input
                                    }
                                />

                                {error && (
                                    <span className="pl-2.5 text-red-500 text-sm">
                                        {error.message}
                                    </span>
                                )}
                            </div>
                        )}
                    />

                    <InputDefault
                        name="password"
                        placeholder={t('pages.singupBasic.passwordPlaceholder')}
                        control={control}
                        rules={Rules.password}
                        label={t('pages.singupBasic.passwordLabel')}
                        type={showPassword ? 'text' : 'password'}
                        rightElement={
                            <button
                                type="button"
                                aria-label={showPassword ? t('common.hidePassword') : t('common.showPassword')}
                                onClick={() => setShowPassword((current) => !current)}
                                className="text-black/70 hover:text-black cursor-pointer"
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        }
                    />

                    <InputDefault
                        name="confirmPassword"
                        placeholder={t('pages.singupBasic.confirmPasswordPlaceholder')}
                        control={control}
                        rules={Rules.confirmPassword}
                        label={t('pages.singupBasic.confirmPasswordLabel')}
                        type={showConfirmPassword ? 'text' : 'password'}
                        rightElement={
                            <button
                                type="button"
                                aria-label={showConfirmPassword ? t('common.hidePassword') : t('common.showPassword')}
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
                            dataTestid="signup-basic-next-button"
                            color="default"
                        >
                            {t('pages.singupBasic.nextButton')}
                        </ButtonDefault>
                    </div>
                </form>
                </div>
        </AuthLayout>
    )
}

export default SingUpBasicPage
