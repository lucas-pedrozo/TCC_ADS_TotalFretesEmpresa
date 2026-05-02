import { ButtonDefault } from '@/components/custom/buttons/ButtonDefault'
import { AuthLayout } from '@/layout/AuthLayout'
import { useNavigate } from 'react-router'

const StartPage = () => {
  const navigate = useNavigate()

  return (
    <AuthLayout transparent>
      <h3 className="text-5xl font-bold text-center mb-20">Seja bem-vindo</h3>
      <ButtonDefault
        type="submit"
        dataTestid="login-button"
        onClick={() => navigate('/Login')}
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
    </AuthLayout>
  )
}

export default StartPage
