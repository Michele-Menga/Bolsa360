import { Link, NavLink, Outlet } from 'react-router-dom'
import { GraduationCap } from 'lucide-react'

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-900 text-white">
              <GraduationCap size={24} />
            </div>

            <span className="text-xl font-bold tracking-tight text-blue-950">
              Bolsa360
            </span>
          </Link>

          <div className="flex items-center gap-6">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `text-sm font-medium transition ${
                  isActive
                    ? 'text-blue-900'
                    : 'text-slate-600 hover:text-blue-900'
                }`
              }
            >
              Início
            </NavLink>

            <NavLink
              to="/oportunidades"
              className={({ isActive }) =>
                `text-sm font-medium transition ${
                  isActive
                    ? 'text-blue-900'
                    : 'text-slate-600 hover:text-blue-900'
                }`
              }
            >
              Oportunidades
            </NavLink>

            <Link
              to="/login"
              className="rounded-lg bg-blue-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800"
            >
              Iniciar sessão
            </Link>
          </div>
        </nav>
      </header>

      <Outlet />
    </div>
  )
}   