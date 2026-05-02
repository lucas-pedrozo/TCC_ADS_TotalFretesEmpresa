import { InputDefault } from '@/components/custom/inputs/InputDefault'
import { ButtonDefault } from '@/components/custom/buttons/ButtonDefault'
import { AuthLayout } from '@/layout/AuthLayout'
import { useRegisterCompanyAddress } from '@/hooks/useRegisterCompanyAddress'
import { useRegisterCompany } from '@/hooks/useRegisterCompany'
import { useNavigate } from 'react-router-dom'

const SingUpAddressPage = () => {
  const navigate = useNavigate()
  const { handleRegisterCompany, isDisabled } = useRegisterCompany()
  const { Rules, control, handleNextCompanyAddress } = useRegisterCompanyAddress(
    handleRegisterCompany
  )

  return (
    <AuthLayout onBack={() => navigate('/SignUp')}>
      <div className="w-full">
        <h3 className="text-5xl font-bold text-start">Endereço</h3>
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); handleNextCompanyAddress() }}
        className="flex flex-col gap-2 w-full"
      >
        <InputDefault
          name="cep"
          placeholder="00000-000"
          control={control}
          rules={Rules.cep}
          label="CEP"
        />

        <InputDefault
          name="city"
          placeholder="Nome da Cidade"
          control={control}
          rules={Rules.city}
          label="Cidade"
        />

        <InputDefault
          name="street"
          placeholder="Exemplo: Rua São Paulo"
          control={control}
          rules={Rules.street}
          label="Rua"
        />

        <InputDefault
          name="number"
          placeholder="Ex: 123"
          control={control}
          rules={Rules.number}
          label="Número"
        />

        <InputDefault
          name="district"
          placeholder="Exemplo: Centro"
          control={control}
          rules={Rules.district}
          label="Bairro"
        />

        <InputDefault
          name="state"
          placeholder="Nenhum"
          control={control}
          rules={Rules.state}
          label="Estado"
        />

        <div className="pt-5">
          <ButtonDefault
            type="submit"
            dataTestid="signup-address-submit-button"
            disabled={isDisabled}
            color="default"
          >
            Criar Conta
          </ButtonDefault>
        </div>
      </form>
    </AuthLayout>
  )
}

export default SingUpAddressPage
