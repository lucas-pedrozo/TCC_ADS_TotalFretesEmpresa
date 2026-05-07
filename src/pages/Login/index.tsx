import { InputDefault } from '@/components/custom/inputs/InputDefault'
import { ButtonDefault } from '@/components/custom/buttons/ButtonDefault'
import { AuthLayout } from '@/layout/AuthLayout'
import { useLogin } from '@/hooks/useLogin'
import { useFadeNavigate } from '@/hooks/useFadeNavigate'
import { useMountFadeIn } from '@/hooks/useMountFadeIn'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FaEye, FaEyeSlash } from 'react-icons/fa'

const LoginPage = () => {
  const { isExiting, navigateWithFade } = useFadeNavigate()
  const { HandleLogin, Rules, control, handleSubmit, isDisabled, isLoading } = useLogin()
  const { t } = useTranslation()
  const [showPassword, setShowPassword] = useState(false)
  const contentClassName = useMountFadeIn({
    className: 'flex w-full min-h-full flex-col justify-center gap-6',
    isExiting,
  })

  return (
    <AuthLayout onBack={() => navigateWithFade('/')} isExiting={isExiting} transparent>
      <div className={contentClassName}>
        <div className="w-full">
          <h3 className="text-5xl font-bold text-start">{t('pages.login.title')}</h3>
        </div>

        <form onSubmit={handleSubmit(HandleLogin)} className="flex flex-col gap-2 w-full">
          <InputDefault
            name="email"
            placeholder={t('pages.login.emailPlaceholder')}
            control={control}
            rules={Rules.email}
            label={t('pages.login.emailLabel')}
            type="email"
          />

          <InputDefault
            name="password"
            placeholder={t('pages.login.passwordPlaceholder')}
            control={control}
            rules={Rules.password}
            label={t('pages.login.passwordLabel')}
            type={showPassword ? 'text' : 'password'}
            rightElement={
              <button
                type="button"
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                onClick={() => setShowPassword((current) => !current)}
                className="text-black/70 hover:text-black cursor-pointer"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            }
          />

          <p className="underline hover:text-stone-600 cursor-pointer pl-2.5">
            {t('pages.login.forgotPassword')}
          </p>

          <div className="pt-5">
            <ButtonDefault
              type="submit"
              dataTestid="login-button"
              disabled={isDisabled}
              isLoading={isLoading}
              color="default"
            >
              {t('common.login')}
            </ButtonDefault>
          </div>
        </form>
      </div>
    </AuthLayout>
  )
}

export default LoginPage
