import type { ReactNode } from 'react'
import logo from '@/assets/logototalfretes.png'
import background from '@/assets/—Pngtree—a white truck drives on_19659555.jpg'

type AuthLayoutProps = {
  children: ReactNode
  transparent?: boolean
  onBack?: () => void
}

export const AuthLayout = ({ children, transparent = false, onBack }: AuthLayoutProps) => {
  return (
    <main
      className="flex items-center justify-between w-full h-screen"
      style={{
        backgroundImage: `url(${background})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        backgroundBlendMode: 'darken',
      }}
    >
      <section className="hidden min-[970px]:flex items-center justify-center gap-5 w-2/3">
        <img
          src={logo}
          alt="Logo Total Fretes"
          className="w-18 rounded-xl"
        />
        <div>
          <h1 className="text-5xl font-bold text-white h-11">Total Fretes</h1>
          <h3 className="text-3xl font-bold text-white pl-1.5">Empresa</h3>
        </div>
      </section>

      <section
        className={`relative flex items-center justify-center w-full min-[970px]:max-w-2xl h-full overflow-y-auto ${
          transparent ? 'bg-white/86 backdrop-blur-sm' : 'bg-white'
        }`}
      >
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="absolute top-5 left-5 flex items-center gap-1 text-sm text-black/50 hover:text-black/80 transition-colors cursor-pointer"
          >
            ← Voltar
          </button>
        )}

        <div className="w-full min-[520px]:max-w-125 min-[970px]:w-3/4 px-4 min-[970px]:p-0 flex flex-col gap-6 py-8">
          {children}
        </div>
      </section>
    </main>
  )
}
