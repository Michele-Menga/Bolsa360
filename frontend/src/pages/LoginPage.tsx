import { Link } from 'react-router-dom'
import { GraduationCap, Mail, Lock, ArrowRight } from 'lucide-react'

export default function LoginPage() {
  return (
    <main className="flex min-h-[calc(100vh-73px)] items-center justify-center bg-slate-50 px-6 py-12">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:grid-cols-2">
        {/* Painel de apresentação */}
        <section className="hidden flex-col justify-between bg-blue-950 p-10 text-white md:flex">
          <div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
              <GraduationCap size={28} />
            </div>

            <h1 className="mt-10 text-3xl font-bold leading-tight">
              O teu próximo passo começa aqui.
            </h1>

            <p className="mt-4 leading-7 text-blue-100">
              Acede à tua conta para organizares o teu percurso,
              acompanhares oportunidades e gerires as tuas candidaturas.
            </p>
          </div>

          <p className="text-sm text-blue-200">
            Bolsa360 · Oportunidades para o teu futuro.
          </p>
        </section>

        {/* Formulário */}
        <section className="p-7 sm:p-10">
          <div className="mb-8 md:hidden">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-950 text-white">
              <GraduationCap size={26} />
            </div>
          </div>

          <p className="text-sm font-semibold text-teal-700">
            Bem-vindo de volta
          </p>

          <h2 className="mt-2 text-3xl font-bold tracking-tight text-blue-950">
            Iniciar sessão
          </h2>

          <p className="mt-3 text-sm leading-6 text-slate-600">
            Introduz os teus dados para acederes à tua conta.
          </p>

          <form
            className="mt-8 space-y-5"
            onSubmit={(event) => {
              event.preventDefault()
              alert('A autenticação será ligada ao backend numa próxima etapa.')
            }}
          >
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Endereço de e-mail
              </label>

              <div className="flex items-center gap-3 rounded-lg border border-slate-300 px-3.5 focus-within:border-blue-800 focus-within:ring-2 focus-within:ring-blue-100">
                <Mail size={19} className="shrink-0 text-slate-400" />

                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="exemplo@email.com"
                  required
                  className="w-full py-3 text-sm outline-none"
                />
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-slate-700"
                >
                  Palavra-passe
                </label>

                <button
                  type="button"
                  className="text-xs font-medium text-blue-800 hover:underline"
                  onClick={() =>
                    alert('A recuperação de palavra-passe será implementada posteriormente.')
                  }
                >
                  Esqueceste-te?
                </button>
              </div>

              <div className="flex items-center gap-3 rounded-lg border border-slate-300 px-3.5 focus-within:border-blue-800 focus-within:ring-2 focus-within:ring-blue-100">
                <Lock size={19} className="shrink-0 text-slate-400" />

                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Introduz a tua palavra-passe"
                  required
                  className="w-full py-3 text-sm outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-900 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-800"
            >
              Entrar
              <ArrowRight size={18} />
            </button>
          </form>

          <div className="my-7 border-t border-slate-100" />

          <p className="text-center text-sm text-slate-600">
            Ainda não tens conta?{' '}
            <Link
              to="/registo"
              className="font-semibold text-blue-900 hover:underline"
            >
              Criar conta
            </Link>
          </p>
        </section>
      </div>
    </main>
  )
}