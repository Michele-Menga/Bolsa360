import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  FileCheck2,
  Building2,
  ChartNoAxesCombined,
  Settings,
  Bell,
  Search,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react'

const navigation = [
  {
    label: 'Início',
    path: '/admin',
    icon: LayoutDashboard,
    end: true,
  },
  {
    label: 'Candidaturas',
    path: '/admin/candidaturas',
    icon: FileCheck2,
  },
  {
    label: 'Estudantes',
    path: '/admin/candidatos',
    icon: Users,
  },
  {
    label: 'Bolsas de Estudo',
    path: '/admin/oportunidades',
    icon: GraduationCap,
  },
  {
    label: 'Instituições de Ensino',
    path: '/admin/instituicoes',
    icon: Building2,
  },
  {
    label: 'Relatórios',
    path: '/admin/relatorios',
    icon: ChartNoAxesCombined,
  },
  {
    label: 'Configurações',
    path: '/admin/configuracoes',
    icon: Settings,
  },
]

export default function AdminLayout() {
  const [menuAberto, setMenuAberto] = useState(false)

  return (
    <div className="min-h-screen bg-[#f1f6fb] text-slate-800 lg:flex">

      {/* Fundo do menu mobile */}
      {menuAberto && (
        <button
          type="button"
          aria-label="Fechar menu"
          onClick={() => setMenuAberto(false)}
          className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden"
        />
      )}

      {/* Barra lateral */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[245px] flex-col bg-[#062c49] text-white transition-transform duration-200 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          menuAberto ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Identidade */}
        <div className="flex h-[76px] items-center justify-between border-b border-white/10 px-5">
          <NavLink
            to="/admin"
            onClick={() => setMenuAberto(false)}
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
              <GraduationCap size={25} />
            </div>

            <div>
              <p className="text-lg font-bold tracking-tight">
                Bolsa360
              </p>
              <p className="text-[10px] tracking-wide text-sky-200">
                GESTÃO DE BOLSAS DE ESTUDO
              </p>
            </div>
          </NavLink>

          <button
            type="button"
            aria-label="Fechar menu"
            onClick={() => setMenuAberto(false)}
            className="rounded-lg p-2 text-white/70 hover:bg-white/10 lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navegação */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
          {navigation.map((item) => {
            const Icon = item.icon

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                onClick={() => setMenuAberto(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-3 text-[13px] transition-colors ${
                    isActive
                      ? 'bg-[#087d80] font-semibold text-white shadow-sm'
                      : 'text-sky-100/90 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                <Icon size={18} strokeWidth={1.8} />
                <span>{item.label}</span>
              </NavLink>
            )
          })}
        </nav>

        {/* Rodapé da barra lateral */}
        <div className="relative overflow-hidden border-t border-white/10 px-5 py-5">
          <div className="pointer-events-none absolute -bottom-10 -right-5 h-28 w-28 rounded-full bg-teal-500/10" />

          <p className="relative text-xs font-semibold text-white">
            Mais oportunidades,
          </p>
          <p className="relative mt-1 text-xs text-sky-200">
            um futuro melhor.
          </p>

          <p className="relative mt-5 text-[10px] text-sky-200/60">
            Bolsa360 · Área administrativa
          </p>
        </div>
      </aside>

      {/* Área principal */}
      <div className="min-w-0 flex-1">

        {/* Cabeçalho superior */}
        <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between gap-4 border-b border-slate-200/80 bg-white px-4 sm:px-6 lg:px-8">

          <div className="flex min-w-0 flex-1 items-center gap-3">
            <button
              type="button"
              aria-label="Abrir menu"
              onClick={() => setMenuAberto(true)}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
            >
              <Menu size={22} />
            </button>

            {/* Pesquisa global */}
            <label className="hidden w-full max-w-md items-center gap-3 rounded-lg border border-slate-200 bg-[#f8fafc] px-3.5 md:flex">
              <Search size={17} className="shrink-0 text-slate-400" />

              <input
                type="search"
                placeholder="Pesquisar por nome, código ou NIF..."
                aria-label="Pesquisa global"
                className="w-full bg-transparent py-2.5 text-xs outline-none placeholder:text-slate-400"
              />
            </label>

            <p className="truncate text-sm font-semibold text-[#082f50] md:hidden">
              Bolsa360
            </p>
          </div>

          {/* Notificações e utilizador */}
          <div className="flex shrink-0 items-center gap-3 sm:gap-5">
            <button
              type="button"
              aria-label="Notificações"
              className="relative rounded-lg p-2 text-slate-500 transition hover:bg-slate-100"
            >
              <Bell size={19} />

              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#079b83] ring-2 ring-white" />
            </button>

            <div className="hidden h-8 border-l border-slate-200 sm:block" />

            <button
              type="button"
              className="flex items-center gap-2.5 rounded-lg py-1 text-left"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#dcecf5] text-sm font-bold text-[#073a5c]">
                AD
              </div>

              <div className="hidden sm:block">
                <p className="text-xs font-semibold text-slate-800">
                  Administrador
                </p>
                <p className="mt-0.5 text-[10px] text-slate-500">
                  Gestor de programas
                </p>
              </div>

              <ChevronDown
                size={15}
                className="hidden text-slate-400 sm:block"
              />
            </button>
          </div>
        </header>

        {/* Conteúdo das páginas */}
        <div className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </div>
    </div>
  )
}