import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Search,
  GraduationCap,
  CalendarDays,
  ArrowRight,
  SlidersHorizontal,
  BookOpen,
  Globe2,
  BriefcaseBusiness,
  FileSearch,
  Info,
} from 'lucide-react'

const categorias = [
  'Todas as categorias',
  'Licenciatura',
  'Mestrado',
  'Doutoramento',
  'Formação profissional',
]

const exemplos = [
  {
    id: 1,
    titulo: 'Bolsa de estudo para licenciatura',
    categoria: 'Licenciatura',
    descricao:
      'Exemplo demonstrativo de uma oportunidade de formação superior.',
    duracao: 'Por definir',
    prazo: 'Por confirmar',
    entidade: 'Entidade demonstrativa',
    icon: GraduationCap,
  },
  {
    id: 2,
    titulo: 'Bolsa para formação de pós-graduação',
    categoria: 'Mestrado',
    descricao:
      'Exemplo demonstrativo de uma oportunidade de formação avançada.',
    duracao: 'Por definir',
    prazo: 'Por confirmar',
    entidade: 'Entidade demonstrativa',
    icon: BookOpen,
  },
  {
    id: 3,
    titulo: 'Programa de formação profissional',
    categoria: 'Formação profissional',
    descricao:
      'Exemplo demonstrativo de uma oportunidade de desenvolvimento de competências.',
    duracao: 'Por definir',
    prazo: 'Por confirmar',
    entidade: 'Entidade demonstrativa',
    icon: BriefcaseBusiness,
  },
  {
    id: 4,
    titulo: 'Oportunidade de doutoramento',
    categoria: 'Doutoramento',
    descricao:
      'Exemplo demonstrativo de uma oportunidade de investigação académica.',
    duracao: 'Por definir',
    prazo: 'Por confirmar',
    entidade: 'Entidade demonstrativa',
    icon: Globe2,
  },
]

export default function OportunidadesPage() {
  const [pesquisa, setPesquisa] = useState('')
  const [categoriaSelecionada, setCategoriaSelecionada] =
    useState('Todas as categorias')

  const oportunidadesFiltradas = useMemo(() => {
    const termo = pesquisa.trim().toLowerCase()

    return exemplos.filter((oportunidade) => {
      const correspondePesquisa =
        oportunidade.titulo.toLowerCase().includes(termo) ||
        oportunidade.categoria.toLowerCase().includes(termo) ||
        oportunidade.descricao.toLowerCase().includes(termo)

      const correspondeCategoria =
        categoriaSelecionada === 'Todas as categorias' ||
        oportunidade.categoria === categoriaSelecionada

      return correspondePesquisa && correspondeCategoria
    })
  }, [pesquisa, categoriaSelecionada])

  return (
    <div className="min-h-screen bg-[#f5f8fb]">
      {/* Cabeçalho da página */}
      <section className="bg-[#062c49]">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-16">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-2 text-xs font-medium text-sky-100">
              <GraduationCap size={15} />
              Explora novas possibilidades
            </div>

            <h1 className="mt-5 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
              Oportunidades de formação
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-sky-100/75 sm:text-base">
              Pesquisa oportunidades de bolsas de estudo e formação.
              Consulta as informações disponíveis e prepara o teu próximo passo.
            </p>
          </div>

          {/* Pesquisa */}
          <div className="mt-9 max-w-4xl rounded-xl bg-white p-3 shadow-xl shadow-slate-950/10 sm:flex sm:items-center sm:gap-3">
            <div className="flex flex-1 items-center gap-3 rounded-lg border border-slate-200 px-3.5 sm:border-0">
              <Search size={19} className="shrink-0 text-slate-400" />

              <input
                type="search"
                value={pesquisa}
                onChange={(event) => setPesquisa(event.target.value)}
                placeholder="Pesquisar por nome ou área..."
                aria-label="Pesquisar oportunidades"
                className="w-full bg-transparent py-3.5 text-sm outline-none placeholder:text-slate-400"
              />
            </div>

            <div className="mt-3 flex items-center gap-3 rounded-lg border border-slate-200 px-3 sm:mt-0 sm:min-w-64">
              <SlidersHorizontal
                size={17}
                className="shrink-0 text-slate-400"
              />

              <select
                value={categoriaSelecionada}
                onChange={(event) =>
                  setCategoriaSelecionada(event.target.value)
                }
                aria-label="Filtrar por categoria"
                className="w-full bg-transparent py-3.5 text-sm text-slate-600 outline-none"
              >
                {categorias.map((categoria) => (
                  <option key={categoria} value={categoria}>
                    {categoria}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Catálogo */}
      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold tracking-[0.14em] text-[#087f78] uppercase">
              Catálogo
            </p>

            <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#073451]">
              Explora as oportunidades
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Consulta as categorias e utiliza os filtros para encontrar o que procuras.
            </p>
          </div>

          <p className="text-xs text-slate-500">
            {oportunidadesFiltradas.length}{' '}
            {oportunidadesFiltradas.length === 1
              ? 'resultado'
              : 'resultados'}
          </p>
        </div>

        {/* Aviso sobre os dados de demonstração */}
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-sky-200 bg-sky-50 p-4">
          <Info size={19} className="mt-0.5 shrink-0 text-sky-700" />

          <div>
            <p className="text-sm font-semibold text-sky-900">
              Conteúdo de demonstração
            </p>

            <p className="mt-1 text-xs leading-5 text-sky-800">
              Os cartões apresentados nesta versão servem apenas para demonstrar
              o funcionamento do catálogo. Não representam bolsas confirmadas
              nem candidaturas abertas.
            </p>
          </div>
        </div>

        {oportunidadesFiltradas.length > 0 ? (
          <div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {oportunidadesFiltradas.map((oportunidade) => {
              const Icon = oportunidade.icon

              return (
                <article
                  key={oportunidade.id}
                  className="flex flex-col rounded-xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_8px_rgba(15,45,70,0.03)] transition hover:-translate-y-1 hover:border-[#a5dcd0] hover:shadow-lg hover:shadow-slate-900/5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#e9f6f3] text-[#087f78]">
                      <Icon size={24} />
                    </div>

                    <span className="rounded-md bg-amber-50 px-2.5 py-1 text-[10px] font-semibold text-amber-700">
                      Exemplo
                    </span>
                  </div>

                  <p className="mt-5 text-xs font-semibold text-[#087f78]">
                    {oportunidade.categoria}
                  </p>

                  <h3 className="mt-2 text-base font-bold leading-6 text-[#073451]">
                    {oportunidade.titulo}
                  </h3>

                  <p className="mt-3 flex-1 text-sm leading-6 text-slate-500">
                    {oportunidade.descricao}
                  </p>

                  <div className="mt-5 space-y-3 border-t border-slate-100 pt-4">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <GraduationCap size={15} />
                      <span>{oportunidade.entidade}</span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <CalendarDays size={15} />
                      <span>Prazo: {oportunidade.prazo}</span>
                    </div>
                  </div>

                  <div className="mt-5">
                    <span className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-500">
                      <FileSearch size={16} />
                      Informação demonstrativa
                    </span>
                  </div>
                </article>
              )
            })}
          </div>
        ) : (
          <div className="mt-7 rounded-xl border border-dashed border-slate-300 bg-white px-5 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
              <Search size={25} />
            </div>

            <h3 className="mt-4 text-base font-bold text-[#073451]">
              Não encontrámos resultados
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Experimenta outra pesquisa ou selecciona uma categoria diferente.
            </p>

            <button
              type="button"
              onClick={() => {
                setPesquisa('')
                setCategoriaSelecionada('Todas as categorias')
              }}
              className="mt-5 text-sm font-semibold text-[#087f78] hover:underline"
            >
              Limpar filtros
            </button>
          </div>
        )}

        <div className="mt-10 rounded-xl border border-slate-200 bg-white p-6 sm:flex sm:items-center sm:justify-between sm:gap-6">
          <div>
            <h3 className="text-base font-bold text-[#073451]">
              Ainda não tens uma conta?
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Cria a tua conta para te preparares para as funcionalidades da plataforma.
            </p>
          </div>

          <Link
            to="/registo"
            className="mt-5 inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[#087f78] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#066a64] sm:mt-0"
          >
            Criar conta
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  )
}