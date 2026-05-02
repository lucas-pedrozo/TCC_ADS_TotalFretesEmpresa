import { InputDefault } from '@/components/custom/inputs/InputDefault'
import { ButtonDefault } from '@/components/custom/buttons/ButtonDefault'
import { AuthLayout } from '@/layout/AuthLayout'
import { useLogin } from '@/hooks/useLogin'
import { useNavigate } from 'react-router-dom'

const LoginPage = () => {
  const navigate = useNavigate()
  const { HandleLogin, Rules, control, handleSubmit, isDisabled } = useLogin()

  return (
    <AuthLayout onBack={() => navigate('/')}>
      <div className="w-full">
        <h3 className="text-5xl font-bold text-start">Faça login</h3>
      </div>

      <form onSubmit={handleSubmit(HandleLogin)} className="flex flex-col gap-2 w-full">
        <InputDefault
          name="email"
          placeholder="usuario@exemplo.com.br"
          control={control}
          rules={Rules.email}
          label="Email"
          type="email"
        />

        <InputDefault
          name="password"
          placeholder="Digite sua senha"
          control={control}
          rules={Rules.password}
          label="Senha"
          type="password"
        />

        <p className="underline hover:text-stone-600 cursor-pointer pl-2.5">
          Esqueci minha senha
        </p>

        <div className="pt-5">
          <ButtonDefault
            type="submit"
            dataTestid="login-button"
            disabled={isDisabled}
            color="default"
          >
            Entrar
          </ButtonDefault>
        </div>
      </form>
    </AuthLayout>
  )
}

export default LoginPage
