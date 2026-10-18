import { NavLink, Outlet } from 'react-router-dom'
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  FileCheck2,
  Settings,
  Bell,
  Menu,
} from 'lucide-react'

const navigation = [
  {
    label: 'Painel geral',
    path: '/admin',
    icon: LayoutDashboard,
    end: true,
  },
  {
    label: 'Oportunidades',
    path: '/admin/oportunidades',
    icon: GraduationCap,
  },
  {
    label: 'Candidatos',
    path: '/admin/candidatos',
    icon: Users,
  },
  {
    label: 'Candidaturas',
    path: '/admin/candidaturas',
    icon: FileCheck2,
  },
]

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 lg:flex">
      {/* Menu lateral */}
      <aside className="flex w-full shrink-0 flex-col bg-blue-950 text-white lg:min-h-screen lg:w-64">
        <div className="flex h-20 items-center gap-3 border-b border-white/10 px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
            <GraduationCap size={25} />
          </div>

          <div>
            <p className="text-lg font-bold tracking-tight">Bolsa360</p>
            <p className="text-xs text-blue-200">Administração</p>
          </div>
        </div>

        <div className="flex-1 px-4 py-6">
          <p className="mb-4 px-3 text-xs font-semibold uppercase tracking-wider text-blue-300">
            Gestão
          </p>

          <nav className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition ${
                      isActive
                        ? 'bg-white text-blue-950'
                        : 'text-blue-100 hover:bg-white/10 hover:text-white'
                    }`
                  }
                >
                  <Icon size={19} />
                  {item.label}
                </NavLink>
              )
            })}
          </nav>
        </div>

        <div className="border-t border-white/10 p-4">
          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm text-blue-100 transition hover:bg-white/10"
          >
            <Settings size={19} />
            Configurações
          </button>

          <div className="mt-4 flex items-center gap-3 rounded-lg bg-white/5 p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-600 font-semibold">
              AD
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">Administrador</p>
              <p className="text-xs text-blue-200">Gestão do sistema</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Área de conteúdo */}
      <div className="min-w-0 flex-1">
        <header className="flex h-20 items-center justify-between border-b border-slate-200 bg-white px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Menu"
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
            >
              <Menu size={22} />
            </button>

            <div>
              <p className="font-semibold text-blue-950">
                Área administrativa
              </p>
              <p className="hidden text-xs text-slate-500 sm:block">
                Gestão de oportunidades e candidaturas
              </p>
            </div>
          </div>

          <button
            type="button"
            aria-label="Notificações"
            className="relative rounded-lg border border-slate-200 p-2.5 text-slate-600 transition hover:bg-slate-50"
          >
            <Bell size={20} />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-teal-600" />
          </button>
        </header>

        <div className="p-5 md:p-8">
          <Outlet />
        </div>
      </div>
    </div>
  )
}