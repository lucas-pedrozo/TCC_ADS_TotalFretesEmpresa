import { InputDefault } from '@/components/custom/inputs/InputDefault'
import { useLogin } from '@/hooks/useLogin'

import logo from '@/assets/logototalfretes.png'
import background from '@/assets/—Pngtree—a white truck drives on_19659555.jpg'
import { ButtonDefault } from '@/components/custom/buttons/ButtonDefault'

const LoginPage = () => {
  const { HandleLogin, isLoading, Rules, control, handleSubmit, isDisabled } = useLogin()

  return (
    <main
      className="flex items-center justify-between w-full h-screen"
      style={{
        backgroundImage: `url(${background})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        backgroundBlendMode: 'darken'
      }}
    >
      <section className='hidden min-[970px]:flex items-center justify-center gap-5 w-2/3'>
        <img
          src={logo}
          alt="Logo Total Fretes"
          className='w-18 rounded-xl'
        />
        <div>
          <h1 className='text-5xl font-bold text-white h-11'>Total Fretes</h1>
          <h3 className='text-3xl font-bold text-white pl-1.5'>Empresa</h3>
        </div>
      </section>

      <section className='flex items-center justify-center bg-white w-full min-[970px]:max-w-2xl h-full'>
        <div className='w-full min-[520px]:max-w-125 min-[970px]:w-3/4 px-4 min-[970px]:p-0 flex flex-col gap-6'>
          <div className="w-full">
            <h3 className='text-5xl font-bold text-start'>Seja bem-vindo</h3>
            <p className='text-base text-start text-black/60'>Faça login para acessar sua conta</p>
          </div>

          <form onSubmit={handleSubmit(HandleLogin)} className='flex flex-col gap-2 w-full'>
            <InputDefault
              name="email"
              placeholder='usuario@exemplo.com.br'
              control={control}
              rules={Rules.email}
              label="Email"
              type="email"
            />

            <InputDefault
              name="password"
              placeholder='Digite sua senha'
              control={control}
              rules={Rules.password}
              label="Senha"
              type="password"
            />

            <p className='underline hover:text-stone-600 cursor-pointer pl-2.5'>
              Esqueci minha senha
            </p>

            <div className='pt-5'>
             <ButtonDefault
                type="submit"
                dataTestid="login-button"
                children="Entrar"
                disabled={isDisabled}
             />
            </div>
          </form>
        </div>
      </section>
    </main>
  )
}

export default LoginPage;