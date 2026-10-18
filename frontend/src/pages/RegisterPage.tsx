import { Link } from 'react-router-dom'
import { GraduationCap, UserRound, Mail, Lock, ArrowRight } from 'lucide-react'

export default function RegisterPage() {
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const form = event.currentTarget
    const data = new FormData(form)

    const password = data.get('password')
    const confirmPassword = data.get('confirmPassword')

    if (password !== confirmPassword) {
      alert('As palavras-passe não coincidem.')
      return
    }

    alert('Formulário validado. O registo será ligado ao backend numa próxima etapa.')
  }

  return (
    <main className="flex min-h-[calc(100vh-73px)] items-center justify-center bg-slate-50 px-6 py-12">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-7 shadow-sm sm:p-10">
        <Link to="/" className="inline-flex items-center gap-2">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-950 text-white">
            <GraduationCap size={25} />
          </div>
          <span className="text-lg font-bold text-blue-950">Bolsa360</span>
        </Link>

        <div className="mt-8">
          <p className="text-sm font-semibold text-teal-700">
            Começa o teu percurso
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-blue-950">
            Criar conta
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-600">
            Cria a tua conta para organizares a pesquisa de oportunidades
            académicas e de formação.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label htmlFor="fullName" className="mb-2 block text-sm font-medium text-slate-700">
              Nome completo
            </label>

            <div className="flex items-center gap-3 rounded-lg border border-slate-300 px-3.5 focus-within:border-blue-800 focus-within:ring-2 focus-within:ring-blue-100">
              <UserRound size={19} className="shrink-0 text-slate-400" />

              <input
                id="fullName"
                name="fullName"
                type="text"
                autoComplete="name"
                placeholder="Introduz o teu nome completo"
                minLength={3}
                required
                className="w-full py-3 text-sm outline-none"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">
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

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-700">
                Palavra-passe
              </label>

              <div className="flex items-center gap-3 rounded-lg border border-slate-300 px-3.5 focus-within:border-blue-800 focus-within:ring-2 focus-within:ring-blue-100">
                <Lock size={18} className="shrink-0 text-slate-400" />

                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Mínimo de 8 caracteres"
                  minLength={8}
                  required
                  className="w-full min-w-0 py-3 text-sm outline-none"
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-slate-700">
                Confirmar palavra-passe
              </label>

              <div className="flex items-center gap-3 rounded-lg border border-slate-300 px-3.5 focus-within:border-blue-800 focus-within:ring-2 focus-within:ring-blue-100">
                <Lock size={18} className="shrink-0 text-slate-400" />

                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Repete a palavra-passe"
                  minLength={8}
                  required
                  className="w-full min-w-0 py-3 text-sm outline-none"
                />
              </div>
            </div>
          </div>

          <p className="text-xs leading-5 text-slate-500">
            Ao criar uma conta, deverás aceitar os termos de utilização
            e a política de privacidade do Bolsa360, que serão definidos
            antes da disponibilização do serviço.
          </p>

          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-900 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-800"
          >
            Criar conta
            <ArrowRight size={18} />
          </button>
        </form>

        <div className="my-7 border-t border-slate-100" />

        <p className="text-center text-sm text-slate-600">
          Já tens uma conta?{' '}
          <Link to="/login" className="font-semibold text-blue-900 hover:underline">
            Iniciar sessão
          </Link>
        </p>
      </div>
    </main>
  )
}