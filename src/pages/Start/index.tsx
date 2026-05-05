import { useState } from 'react'
import { ButtonDefault } from '@/components/custom/buttons/ButtonDefault'
import { AuthLayout } from '@/layout/AuthLayout'
import { cn } from '@/lib/utils'
import { useNavigate } from 'react-router'

const LOGIN_SLIDE_MS = 320

const StartPage = () => {
  const navigate = useNavigate()
  const [loginPressed, setLoginPressed] = useState(false)

  const handleGoToLogin = () => {
    if (loginPressed) return
    setLoginPressed(true)
    window.setTimeout(() => navigate('/Login'), LOGIN_SLIDE_MS)
  }

  return (
    <AuthLayout transparent>
      <div
        className={cn(
          'flex w-full flex-col gap-6 transition-transform duration-300 ease-out will-change-transform',
          loginPressed && 'translate-x-4 opacity-0',
        )}
      >
        <h3 className="mb-20 text-center text-5xl font-bold">Seja bem-vindo</h3>
        <ButtonDefault
          type="button"
          dataTestid="login-button"
          onClick={handleGoToLogin}
          color="default"
        >
          Entrar
        </ButtonDefault>
        <ButtonDefault
          type="button"
          dataTestid="signup-button"
          onClick={() => navigate('/SignUp')}
          color="primary"
        >
          Cadastre-se
        </ButtonDefault>
      </div>
    </AuthLayout>
  )
}

export default StartPage
