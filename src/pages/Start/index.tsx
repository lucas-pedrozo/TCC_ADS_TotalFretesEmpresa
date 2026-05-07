import { ButtonDefault } from '@/components/custom/buttons/ButtonDefault'
import { AuthLayout } from '@/layout/AuthLayout'
import { useFadeNavigate } from '@/hooks/useFadeNavigate'
import { fadeExitClassName } from '@/utils/ui'
import { useTranslation } from 'react-i18next'

const StartPage = () => {
  const { isExiting, navigateWithFade } = useFadeNavigate()
  const { t } = useTranslation()

  return (
    <AuthLayout transparent>
      <div
        className={fadeExitClassName(
          isExiting,
          'flex w-full min-h-[calc(100dvh-7rem)] flex-col justify-center gap-6',
        )}
      >
        <h3 className="mb-8 text-center text-5xl font-bold">{t('pages.start.welcome')}</h3>
        <ButtonDefault
          type="button"
          dataTestid="login-button"
          onClick={() => navigateWithFade('/Login')}
          color="default"
        >
          {t('common.login')}
        </ButtonDefault>
        <ButtonDefault
          type="button"
          dataTestid="signup-button"
          onClick={() => navigateWithFade('/SignUp')}
          color="tertiary"
        >
          {t('common.signup')}
        </ButtonDefault>
      </div>
    </AuthLayout>
  )
}

export default StartPage
