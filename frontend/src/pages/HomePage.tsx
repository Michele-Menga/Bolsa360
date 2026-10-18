import { Link } from 'react-router-dom'
import { ArrowRight, Search, ShieldCheck, Globe } from 'lucide-react'

export default function HomePage() {
  return (
    <main>
      <section className="bg-slate-50">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 md:grid-cols-2 md:py-28">
          <div>
            <span className="inline-flex rounded-full bg-teal-50 px-4 py-2 text-sm font-semibold text-teal-800">
              Oportunidades para o teu futuro
            </span>

            <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight text-blue-950 md:text-6xl">
              O próximo passo da tua formação começa aqui.
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
              Descobre bolsas de estudo e oportunidades de formação,
              organiza a tua pesquisa e acompanha as oportunidades
              que mais se adequam aos teus objectivos.
            </p>

            <Link
              to="/oportunidades"
              className="mt-8 inline-flex items-center gap-2 rounded-lg bg-blue-900 px-6 py-3.5 font-semibold text-white transition hover:bg-blue-800"
            >
              Explorar oportunidades
              <ArrowRight size={18} />
            </Link>

            <p className="mt-4 text-sm text-slate-500">
              Informação organizada para apoiar as tuas decisões.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-900">
                <Search size={24} />
              </div>

              <div>
                <h2 className="font-semibold text-slate-900">
                  Pesquisa oportunidades
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Encontra opções para o teu percurso.
                </p>
              </div>
            </div>

            <div className="my-6 border-t border-slate-100" />

            <div className="space-y-5">
              <div className="flex gap-3">
                <ShieldCheck className="mt-0.5 shrink-0 text-teal-700" size={21} />

                <div>
                  <h3 className="font-medium">Informação organizada</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    Consulta os detalhes e os requisitos de cada oportunidade.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Globe className="mt-0.5 shrink-0 text-teal-700" size={21} />

                <div>
                  <h3 className="font-medium">Oportunidades diversas</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    Explora oportunidades nacionais e internacionais,
                    de acordo com a informação disponível.
                  </p>
                </div>
              </div>
            </div>

            <Link
              to="/oportunidades"
              className="mt-8 flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 text-sm font-semibold text-blue-900 transition hover:bg-slate-50"
            >
              Ver catálogo
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <h2 className="text-2xl font-bold text-blue-950">
          Uma forma mais simples de procurar oportunidades
        </h2>

        <p className="mt-3 max-w-2xl leading-7 text-slate-600">
          O Bolsa360 pretende reunir informação útil num único espaço,
          facilitando a pesquisa e a organização do percurso académico
          e formativo dos candidatos.
        </p>
      </section>
    </main>
  )
}