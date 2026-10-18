import {
  GraduationCap,
  Users,
  FileCheck2,
  Clock3,
  ArrowUpRight,
  MoreHorizontal,
} from 'lucide-react'

const indicadores = [
  {
    titulo: 'Oportunidades',
    valor: 'xx',
    descricao: 'Registadas no sistema',
    icon: GraduationCap,
    iconStyle: 'bg-blue-50 text-blue-800',
  },
  {
    titulo: 'Candidatos',
    valor: 'xx',
    descricao: 'Contas registadas',
    icon: Users,
    iconStyle: 'bg-teal-50 text-teal-800',
  },
  {
    titulo: 'Candidaturas',
    valor: 'xx',
    descricao: 'Submetidas no sistema',
    icon: FileCheck2,
    iconStyle: 'bg-violet-50 text-violet-800',
  },
  {
    titulo: 'Por analisar',
    valor: 'xx',
    descricao: 'Pendentes de revisão',
    icon: Clock3,
    iconStyle: 'bg-amber-50 text-amber-800',
  },
]

const oportunidades = [
  {
    titulo: 'Bolsa de estudo',
    instituicao: 'Instituição demonstrativa',
    categoria: 'xxxxxxx',
    estado: 'xxxxxxx',
    estadoStyle: 'bg-slate-100 text-slate-700',
  },
  {
    titulo: 'Programa de formação',
    instituicao: 'Instituição demonstrativa',
    categoria: 'xxxxxxx',
    estado: 'xxxxxxx',
    estadoStyle: 'bg-emerald-50 text-emerald-700',
  },
  {
    titulo: 'Oportunidade internacional ',
    instituicao: 'Instituição demonstrativa',
    categoria: 'xxxxxxx',
    estado: 'xxxxxxx',
    estadoStyle: 'bg-amber-50 text-amber-800',
  },
]

export default function PainelAdminPage() {
  return (
    <main>
      {/* Título */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm text-slate-500">
            Administração / Painel geral
          </p>

          <h1 className="mt-2 text-2xl font-bold tracking-tight text-blue-950 md:text-3xl">
            Visão geral
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            Acompanha a actividade e gere as informações do Bolsa360.
          </p>
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-800"
        >
          <GraduationCap size={18} />
          Nova oportunidade
        </button>
      </div>

      {/* Indicadores */}
      <section
        aria-label="Indicadores do sistema"
        className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4"
      >
        {indicadores.map((indicador) => {
          const Icon = indicador.icon

          return (
            <article
              key={indicador.titulo}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-medium text-slate-600">
                  {indicador.titulo}
                </p>

                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg ${indicador.iconStyle}`}
                >
                  <Icon size={21} />
                </div>
              </div>

              <p className="mt-5 text-3xl font-bold tracking-tight text-blue-950">
                {indicador.valor}
              </p>

              <p className="mt-2 text-xs text-slate-500">
                {indicador.descricao}
              </p>
            </article>
          )
        })}
      </section>

      {/* Tabela */}
      <section className="mt-8 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-semibold text-blue-950">
              Oportunidades recentes
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Exemplos de registos para estruturar a interface.
            </p>
          </div>

          <button
            type="button"
            className="inline-flex items-center gap-2 text-sm font-semibold text-blue-900 hover:text-blue-700"
          >
            Ver todas
            <ArrowUpRight size={16} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-4 font-semibold">Oportunidade</th>
                <th className="px-5 py-4 font-semibold">Categoria</th>
                <th className="px-5 py-4 font-semibold">Estado</th>
                <th className="px-5 py-4 text-right font-semibold">
                  Acções
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {oportunidades.map((oportunidade) => (
                <tr
                  key={oportunidade.titulo}
                  className="transition hover:bg-slate-50"
                >
                  <td className="px-5 py-4">
                    <p className="font-medium text-slate-900">
                      {oportunidade.titulo}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {oportunidade.instituicao}
                    </p>
                  </td>

                  <td className="px-5 py-4 text-slate-600">
                    {oportunidade.categoria}
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${oportunidade.estadoStyle}`}
                    >
                      {oportunidade.estado}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-right">
                    <button
                      type="button"
                      aria-label={`Mais opções para ${oportunidade.titulo}`}
                      className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                    >
                      <MoreHorizontal size={19} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-200 px-5 py-4">
          <p className="text-xs text-slate-500">
            Dados demonstrativos — a integração com a base de dados será feita posteriormente.
          </p>
        </div>
      </section>
    </main>
  )
}