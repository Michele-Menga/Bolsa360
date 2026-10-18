import { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import {
  GraduationCap,
  Menu,
  X,
  ArrowRight,
  Mail,
  MapPin,
} from 'lucide-react'

const links = [
  { label: 'Início', to: '/', end: true },
  { label: 'Oportunidades', to: '/oportunidades', end: false },
]

export default function PublicLayout() {
  const [menuAberto, setMenuAberto] = useState(false)

  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-800">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-8">
          {/* Logótipo */}
          <Link
            to="/"
            onClick={() => setMenuAberto(false)}
            className="flex items-center gap-3"
            aria-label="Bolsa360 - Página inicial"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#073451] text-white">
              <GraduationCap size={27} strokeWidth={1.8} />
            </div>

            <div>
              <p className="text-xl font-bold tracking-tight text-[#073451]">
                Bolsa360
              </p>
              <p className="text-[10px] font-medium tracking-[0.13em] text-slate-500">
                OPORTUNIDADES PARA O TEU FUTURO
              </p>
            </div>
          </Link>

          {/* Navegação para computador */}
          <nav className="hidden items-center gap-8 md:flex">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `relative py-2 text-sm transition ${
                    isActive
                      ? 'font-semibold text-[#073451]'
                      : 'text-slate-600 hover:text-[#073451]'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {link.label}

                    {isActive && (
                      <span className="absolute right-0 bottom-0 left-0 h-0.5 rounded-full bg-[#079b83]" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Acesso à conta */}
          <div className="hidden items-center gap-3 md:flex">
            <Link
              to="/login"
              className="rounded-lg px-4 py-2.5 text-sm font-semibold text-[#073451] transition hover:bg-slate-50"
            >
              Iniciar sessão
            </Link>

            <Link
              to="/registo"
              className="inline-flex items-center gap-2 rounded-lg bg-[#087f78] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#066a64]"
            >
              Criar conta
              <ArrowRight size={16} />
            </Link>
          </div>

          {/* Botão do menu móvel */}
          <button
            type="button"
            aria-label={menuAberto ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={menuAberto}
            onClick={() => setMenuAberto(!menuAberto)}
            className="rounded-lg p-2 text-[#073451] transition hover:bg-slate-100 md:hidden"
          >
            {menuAberto ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Navegação móvel */}
        {menuAberto && (
          <div className="border-t border-slate-200 bg-white px-5 py-4 md:hidden">
            <nav className="mx-auto flex max-w-7xl flex-col gap-1">
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  onClick={() => setMenuAberto(false)}
                  className={({ isActive }) =>
                    `rounded-lg px-4 py-3 text-sm ${
                      isActive
                        ? 'bg-[#e9f6f3] font-semibold text-[#087f78]'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}

              <div className="my-2 border-t border-slate-100" />

              <Link
                to="/login"
                onClick={() => setMenuAberto(false)}
                className="rounded-lg px-4 py-3 text-sm font-semibold text-[#073451] hover:bg-slate-50"
              >
                Iniciar sessão
              </Link>

              <Link
                to="/registo"
                onClick={() => setMenuAberto(false)}
                className="rounded-lg bg-[#087f78] px-4 py-3 text-center text-sm font-semibold text-white"
              >
                Criar conta
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* Conteúdo da página */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Rodapé */}
      <footer className="border-t border-slate-200 bg-[#062c49] text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:px-8 md:grid-cols-3">
          <div>
            <Link to="/" className="inline-flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
                <GraduationCap size={24} />
              </div>

              <span className="text-xl font-bold">Bolsa360</span>
            </Link>

            <p className="mt-4 max-w-sm text-sm leading-6 text-sky-100/75">
              Uma plataforma para descobrir oportunidades de bolsas de estudo
              e acompanhar o teu percurso académico.
            </p>
          </div>

          <div>
            <h2 className="text-sm font-semibold">Navegação</h2>

            <div className="mt-4 flex flex-col items-start gap-3 text-sm text-sky-100/75">
              <Link to="/" className="transition hover:text-white">
                Página inicial
              </Link>

              <Link
                to="/oportunidades"
                className="transition hover:text-white"
              >
                Explorar oportunidades
              </Link>

              <Link to="/registo" className="transition hover:text-white">
                Criar conta
              </Link>

              <Link to="/login" className="transition hover:text-white">
                Iniciar sessão
              </Link>
            </div>
          </div>

          <div>
            <h2 className="text-sm font-semibold">Bolsa360</h2>

            <div className="mt-4 space-y-3 text-sm text-sky-100/75">
              <p className="flex items-start gap-3">
                <GraduationCap size={17} className="mt-0.5 shrink-0" />
                Informação organizada para apoiar a procura de oportunidades.
              </p>

              <p className="flex items-start gap-3">
                <MapPin size={17} className="mt-0.5 shrink-0" />
                Angola
              </p>

              <p className="flex items-start gap-3">
                <Mail size={17} className="mt-0.5 shrink-0" />
                Plataforma em desenvolvimento
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10">
          <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-5 text-xs text-sky-100/60 sm:px-8 sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {new Date().getFullYear()} Bolsa360. Todos os direitos reservados.
            </p>

            <p>Oportunidades para construir o teu futuro.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}