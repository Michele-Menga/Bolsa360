import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import {
  GraduationCap,
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  Info,
} from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mostrarPassword, setMostrarPassword] = useState(false)
  const [erro, setErro] = useState('')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErro('')

    if (!email.trim() || !password) {
      setErro('Preenche o e-mail e a palavra-passe.')
      return
    }

    window.alert(
      'O formulário está válido, mas o início de sessão ainda não está ligado ao servidor.',
    )
  }

  return (
    <section className="min-h-[calc(100vh-76px)] bg-[#f5f8fb] px-5 py-10 sm:px-8 sm:py-12 lg:py-16">
      <div className="mx-auto grid min-h-[70vh] max-w-6xl items-start gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-center lg:gap-12">
        {/* Coluna esquerda */}
        <div className="hidden lg:block">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#073451] text-white">
            <GraduationCap size={30} />
          </div>

          <p className="mt-6 text-xs font-bold tracking-[0.15em] text-[#087f78] uppercase">
            Bem-vindo de volta
          </p>

          <h1 className="mt-3 max-w-lg text-4xl leading-tight font-bold tracking-tight text-[#073451]">
            O teu próximo passo começa aqui.
          </h1>

          <p className="mt-4 max-w-lg text-sm leading-7 text-slate-500">
            Inicia sessão para continuares a acompanhar as oportunidades de
            bolsas de estudo e formação disponíveis no Bolsa360.
          </p>

          <div className="mt-7 space-y-3.5">
            {[
              'Consulta oportunidades de formação.',
              'Acompanha as informações relevantes.',
              'Prepara-te para novas possibilidades.',
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <CheckCircle2
                  size={18}
                  className="shrink-0 text-[#087f78]"
                />

                <p className="text-sm text-slate-600">{item}</p>
              </div>
            ))}
          </div>

          <div className="mt-9 inline-flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#073451] text-white">
              <GraduationCap size={22} />
            </div>

            <div>
              <p className="text-sm font-bold text-[#073451]">Bolsa360</p>
              <p className="mt-1 text-xs text-slate-500">
                Informação para o teu próximo passo.
              </p>
            </div>
          </div>
        </div>

        {/* Coluna direita: formulário */}
        <div className="mx-auto w-full max-w-md">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_35px_rgba(15,45,70,0.06)] sm:p-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e9f6f3] text-[#087f78] lg:hidden">
              <GraduationCap size={25} />
            </div>

            <p className="mt-3 text-xs font-bold tracking-[0.14em] text-[#087f78] uppercase">
              A tua área pessoal
            </p>

            <h2 className="mt-1.5 text-xl font-bold tracking-tight text-[#073451]">
              Iniciar sessão
            </h2>

            <p className="mt-1.5 text-sm leading-5 text-slate-500">
              Introduz os teus dados para continuares.
            </p>

            <form onSubmit={handleSubmit} className="mt-5 space-y-3.5">
              {/* E-mail */}
              <div>
                <label
                  htmlFor="login-email"
                  className="mb-1.5 block text-xs font-semibold text-slate-700"
                >
                  Endereço de e-mail
                </label>

                <div className="flex items-center gap-3 rounded-lg border border-slate-200 px-3 transition focus-within:border-[#087f78] focus-within:ring-2 focus-within:ring-[#087f78]/10">
                  <Mail size={17} className="shrink-0 text-slate-400" />

                  <input
                    id="login-email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="nome@exemplo.com"
                    className="w-full bg-transparent py-2.5 text-sm outline-none placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Palavra-passe */}
              <div>
                <label
                  htmlFor="login-password"
                  className="mb-1.5 block text-xs font-semibold text-slate-700"
                >
                  Palavra-passe
                </label>

                <div className="flex items-center gap-3 rounded-lg border border-slate-200 px-3 transition focus-within:border-[#087f78] focus-within:ring-2 focus-within:ring-[#087f78]/10">
                  <LockKeyhole
                    size={17}
                    className="shrink-0 text-slate-400"
                  />

                  <input
                    id="login-password"
                    type={mostrarPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Introduz a tua palavra-passe"
                    className="w-full bg-transparent py-2.5 text-sm outline-none placeholder:text-slate-400"
                  />

                  <button
                    type="button"
                    onClick={() => setMostrarPassword(!mostrarPassword)}
                    aria-label={
                      mostrarPassword
                        ? 'Ocultar palavra-passe'
                        : 'Mostrar palavra-passe'
                    }
                    className="shrink-0 text-slate-400 hover:text-slate-700"
                  >
                    {mostrarPassword ? (
                      <EyeOff size={17} />
                    ) : (
                      <Eye size={17} />
                    )}
                  </button>
                </div>
              </div>

              {/* Mensagem de erro */}
              {erro && (
                <p
                  role="alert"
                  className="rounded-lg border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-700"
                >
                  {erro}
                </p>
              )}

              {/* Recuperação de palavra-passe */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() =>
                    window.alert(
                      'A recuperação da palavra-passe ainda não está disponível.',
                    )
                  }
                  className="text-xs font-semibold text-[#087f78] hover:underline"
                >
                  Esqueceste a palavra-passe?
                </button>
              </div>

              {/* Botão de entrada */}
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#087f78] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#066a64]"
              >
                Entrar na minha conta
                <ArrowRight size={16} />
              </button>
            </form>

            {/* Aviso de desenvolvimento */}
            <div className="mt-4 flex items-start gap-2 rounded-lg bg-sky-50 p-2.5">
              <Info size={15} className="mt-0.5 shrink-0 text-sky-700" />

              <p className="text-[11px] leading-4 text-sky-800">
                O início de sessão ainda não está ligado ao servidor. A
                autenticação não está activa.
              </p>
            </div>

            <p className="mt-4 text-center text-xs text-slate-500">
              Ainda não tens uma conta?{' '}
              <Link
                to="/registo"
                className="font-semibold text-[#087f78] hover:underline"
              >
                Criar conta
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}