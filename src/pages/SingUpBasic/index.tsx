import { InputDefault } from '@/components/custom/inputs/InputDefault'
import { ButtonDefault } from '@/components/custom/buttons/ButtonDefault'
import { AuthLayout } from '@/layout/AuthLayout'
import { useRegisterCompanyBasic } from '@/hooks/useRegisterCompanyBasic'
import { useFadeNavigate } from '@/hooks/useFadeNavigate'
import { useMountFadeIn } from '@/hooks/useMountFadeIn'
import { useTranslation } from 'react-i18next'

const SingUpBasicPage = () => {
  const { t } = useTranslation()
  const { isExiting, navigateWithFade } = useFadeNavigate()
  const { Rules, control, handleNextCompanyBasic } = useRegisterCompanyBasic(() =>
    navigateWithFade('/SignUpAddress'),
  )
  const contentClassName = useMountFadeIn({
    className: 'flex w-full flex-col gap-6',
    isExiting,
  })

  return (
    <AuthLayout onBack={() => navigateWithFade('/')} isExiting={isExiting} transparent>
      <div className={contentClassName}>
        <div className="w-full">
          <h3 className="text-5xl font-bold text-start">{t('pages.singupBasic.title')}</h3>
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
          />

          <InputDefault
            name="cnpj"
            placeholder={t('pages.singupBasic.cnpjPlaceholder')}
            control={control}
            rules={Rules.cnpj}
            label={t('pages.singupBasic.cnpjLabel')}
            mask="cnpj"
          />

          <InputDefault
            name="phoneNumber"
            placeholder={t('pages.singupBasic.phoneNumberPlaceholder')}
            control={control}
            rules={Rules.phoneNumber}
            label={t('pages.singupBasic.phoneNumberLabel')}
            mask="phone"
          />

          <InputDefault
            name="birthFundation"
            placeholder={t('pages.singupBasic.birthFundationPlaceholder')}
            control={control}
            rules={Rules.birthFundation}
            label={t('pages.singupBasic.birthFundationLabel')}
            type="date"
          />

          <InputDefault
            name="password"
            placeholder={t('pages.singupBasic.passwordPlaceholder')}
            control={control}
            rules={Rules.password}
            label={t('pages.singupBasic.passwordLabel')}
            type="password"
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
