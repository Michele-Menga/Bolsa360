import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import {
  GraduationCap,
  UserRound,
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  Info,
} from 'lucide-react'

export default function RegisterPage() {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmarPassword, setConfirmarPassword] = useState('')
  const [mostrarPassword, setMostrarPassword] = useState(false)
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false)
  const [erro, setErro] = useState('')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErro('')

    if (password.length < 8) {
      setErro('A palavra-passe deve ter pelo menos 8 caracteres.')
      return
    }

    if (password !== confirmarPassword) {
      setErro('As palavras-passe não coincidem.')
      return
    }

    window.alert(
      'O formulário está válido, mas o registo ainda não está ligado ao servidor.',
    )
  }

  return (
    <section className="bg-[#f5f8fb] px-5 py-8 sm:px-8 sm:py-10">
      <div className="mx-auto grid max-w-6xl items-start gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-12">
        {/* Coluna esquerda */}
        <div className="hidden lg:block">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#073451] text-white">
            <GraduationCap size={30} />
          </div>

          <p className="mt-6 text-xs font-bold tracking-[0.15em] text-[#087f78] uppercase">
            Dá o primeiro passo
          </p>

          <h1 className="mt-3 max-w-lg text-4xl leading-tight font-bold tracking-tight text-[#073451]">
            Cria a tua conta no Bolsa360.
          </h1>

          <p className="mt-4 max-w-lg text-sm leading-7 text-slate-500">
            Começa a organizar a tua procura por bolsas de estudo e outras
            oportunidades de formação.
          </p>

          <div className="mt-7 space-y-3.5">
            {[
              'Acede ao catálogo de oportunidades.',
              'Consulta informações sobre os requisitos.',
              'Prepara-te para acompanhar as próximas funcionalidades.',
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
              Junta-te ao Bolsa360
            </p>

            <h2 className="mt-1.5 text-xl font-bold tracking-tight text-[#073451]">
              Criar conta
            </h2>

            <p className="mt-1.5 text-sm leading-5 text-slate-500">
              Preenche os campos abaixo para iniciares o registo.
            </p>

            <form onSubmit={handleSubmit} className="mt-5 space-y-3.5">
              {/* Nome completo */}
              <div>
                <label
                  htmlFor="registo-nome"
                  className="mb-1.5 block text-xs font-semibold text-slate-700"
                >
                  Nome completo
                </label>

                <div className="flex items-center gap-3 rounded-lg border border-slate-200 px-3 transition focus-within:border-[#087f78] focus-within:ring-2 focus-within:ring-[#087f78]/10">
                  <UserRound size={17} className="shrink-0 text-slate-400" />

                  <input
                    id="registo-nome"
                    type="text"
                    autoComplete="name"
                    required
                    minLength={3}
                    value={nome}
                    onChange={(event) => setNome(event.target.value)}
                    placeholder="O teu nome completo"
                    className="w-full bg-transparent py-2.5 text-sm outline-none placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* E-mail */}
              <div>
                <label
                  htmlFor="registo-email"
                  className="mb-1.5 block text-xs font-semibold text-slate-700"
                >
                  Endereço de e-mail
                </label>

                <div className="flex items-center gap-3 rounded-lg border border-slate-200 px-3 transition focus-within:border-[#087f78] focus-within:ring-2 focus-within:ring-[#087f78]/10">
                  <Mail size={17} className="shrink-0 text-slate-400" />

                  <input
                    id="registo-email"
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
                  htmlFor="registo-password"
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
                    id="registo-password"
                    type={mostrarPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Mínimo de 8 caracteres"
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

              {/* Confirmação da palavra-passe */}
              <div>
                <label
                  htmlFor="registo-confirmacao"
                  className="mb-1.5 block text-xs font-semibold text-slate-700"
                >
                  Confirmar palavra-passe
                </label>

                <div className="flex items-center gap-3 rounded-lg border border-slate-200 px-3 transition focus-within:border-[#087f78] focus-within:ring-2 focus-within:ring-[#087f78]/10">
                  <LockKeyhole
                    size={17}
                    className="shrink-0 text-slate-400"
                  />

                  <input
                    id="registo-confirmacao"
                    type={mostrarConfirmacao ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={confirmarPassword}
                    onChange={(event) =>
                      setConfirmarPassword(event.target.value)
                    }
                    placeholder="Repete a palavra-passe"
                    className="w-full bg-transparent py-2.5 text-sm outline-none placeholder:text-slate-400"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setMostrarConfirmacao(!mostrarConfirmacao)
                    }
                    aria-label={
                      mostrarConfirmacao
                        ? 'Ocultar confirmação'
                        : 'Mostrar confirmação'
                    }
                    className="shrink-0 text-slate-400 hover:text-slate-700"
                  >
                    {mostrarConfirmacao ? (
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

              {/* Botão de registo */}
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#087f78] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#066a64]"
              >
                Criar conta
                <ArrowRight size={16} />
              </button>
            </form>

            {/* Aviso de desenvolvimento */}
            <div className="mt-4 flex items-start gap-2 rounded-lg bg-sky-50 p-2.5">
              <Info size={15} className="mt-0.5 shrink-0 text-sky-700" />

              <p className="text-[11px] leading-4 text-sky-800">
                O registo ainda não está ligado ao servidor. Os dados não são
                guardados.
              </p>
            </div>

            <p className="mt-4 text-center text-xs text-slate-500">
              Já tens uma conta?{' '}
              <Link
                to="/login"
                className="font-semibold text-[#087f78] hover:underline"
              >
                Iniciar sessão
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}