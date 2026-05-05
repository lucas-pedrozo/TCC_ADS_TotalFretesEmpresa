import { ButtonDefault } from '@/components/custom/buttons/ButtonDefault'
import { AuthLayout } from '@/layout/AuthLayout'
import { useFadeNavigate } from '@/hooks/useFadeNavigate'
import { fadeExitClassName } from '@/utils/ui'

const StartPage = () => {
  const { isExiting, navigateWithFade } = useFadeNavigate()

  return (
    <AuthLayout transparent>
      <div className={fadeExitClassName(isExiting, 'flex w-full flex-col gap-6')}>
        <h3 className="mb-20 text-center text-5xl font-bold">Seja bem-vindo</h3>
        <ButtonDefault
          type="button"
          dataTestid="login-button"
          onClick={() => navigateWithFade('/Login')}
          color="default"
        >
          Entrar
        </ButtonDefault>
        <ButtonDefault
          type="button"
          dataTestid="signup-button"
          onClick={() => navigateWithFade('/SignUp')}
          color="primary"
        >
          Cadastre-se
        </ButtonDefault>
      </div>
    </AuthLayout>
  )
}

export default StartPage
