import { InputDefault } from '@/components/custom/inputs/InputDefault'
import { ButtonDefault } from '@/components/custom/buttons/ButtonDefault'
import { AuthLayout } from '@/layout/AuthLayout'
import { useRegisterCompanyBasic } from '@/hooks/useRegisterCompanyBasic'
import { useNavigate } from 'react-router-dom'

const SingUpBasicPage = () => {
  const navigate = useNavigate()
  const { Rules, control, handleNextCompanyBasic } = useRegisterCompanyBasic(
    () => navigate('/SignUpAddress')
  )

  return (
    <AuthLayout onBack={() => navigate('/')} transparent>
      <div className="w-full">
        <h3 className="text-5xl font-bold text-start">Cadastro</h3>
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); handleNextCompanyBasic() }}
        className="flex flex-col gap-2 w-full"
      >
        <InputDefault
          name="name"
          placeholder="Nome Completo"
          control={control}
          rules={Rules.name}
          label="Nome Completo"
        />

        <InputDefault
          name="email"
          placeholder="usuario@exemplo.com"
          control={control}
          rules={Rules.email}
          label="Email"
          type="email"
        />

        <InputDefault
          name="cnpj"
          placeholder="00.000.000/0000-00"
          control={control}
          rules={Rules.cnpj}
          label="CNPJ"
        />

        <InputDefault
          name="phoneNumber"
          placeholder="(00) 000000000"
          control={control}
          rules={Rules.phoneNumber}
          label="Telefone"
        />

        <InputDefault
          name="password"
          placeholder="Senha"
          control={control}
          rules={Rules.password}
          label="Senha"
          type="password"
        />

        <div className="pt-5">
          <ButtonDefault
            type="submit"
            dataTestid="signup-basic-next-button"
            color="default"
          >
            Próximo
          </ButtonDefault>
        </div>
      </form>
    </AuthLayout>
  )
}

export default SingUpBasicPage
