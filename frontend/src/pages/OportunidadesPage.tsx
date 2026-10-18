import { Search, SlidersHorizontal } from 'lucide-react'

export default function OportunidadesPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <p className="text-sm font-semibold text-teal-700">
            Bolsa360 / Oportunidades
          </p>

          <h1 className="mt-3 text-3xl font-bold tracking-tight text-blue-950 md:text-4xl">
            Explora oportunidades
          </h1>

          <p className="mt-3 max-w-2xl leading-7 text-slate-600">
            Pesquisa oportunidades de bolsas de estudo e formação
            e consulta os requisitos de cada uma.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 md:flex-row">
          <label className="flex flex-1 items-center gap-3 rounded-lg border border-slate-200 px-4 py-3">
            <Search size={20} className="shrink-0 text-slate-400" />

            <input
              type="search"
              placeholder="Pesquisar por título ou instituição"
              aria-label="Pesquisar por título ou instituição"
              className="w-full bg-transparent text-sm outline-none"
            />
          </label>

          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-5 py-3 text-sm font-medium text-slate-700"
          >
            <SlidersHorizontal size={18} />
            Filtros
          </button>
        </div>

        <div className="mt-8 rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
            <Search size={24} className="text-slate-500" />
          </div>

          <h2 className="mt-5 text-lg font-semibold text-slate-900">
            O catálogo está a ser preparado
          </h2>

          <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-600">
            Nesta fase, ainda não estamos a apresentar oportunidades
            verificadas. O catálogo será ligado aos dados da aplicação
            quando implementarmos o serviço correspondente.
          </p>
        </div>
      </section>
    </main>
  )
}