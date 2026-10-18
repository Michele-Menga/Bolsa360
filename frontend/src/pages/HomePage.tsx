import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Search,
  GraduationCap,
  BriefcaseBusiness,
  Globe2,
  BookOpen,
  CheckCircle2,
  Compass,
  FileSearch,
  Target,
} from 'lucide-react'

const categorias = [
  {
    titulo: 'Licenciatura',
    descricao: 'Oportunidades para formação superior.',
    icon: GraduationCap,
  },
  {
    titulo: 'Mestrado e doutoramento',
    descricao: 'Continua a tua formação académica.',
    icon: BookOpen,
  },
  {
    titulo: 'Formação profissional',
    descricao: 'Desenvolve novas competências.',
    icon: BriefcaseBusiness,
  },
  {
    titulo: 'Oportunidades internacionais',
    descricao: 'Descobre possibilidades além-fronteiras.',
    icon: Globe2,
  },
]

const etapas = [
  {
    numero: '01',
    titulo: 'Cria a tua conta',
    descricao:
      'Regista-te na plataforma para começares a organizar a tua procura.',
    icon: CheckCircle2,
  },
  {
    numero: '02',
    titulo: 'Explora oportunidades',
    descricao:
      'Consulta as oportunidades disponíveis e verifica os requisitos.',
    icon: FileSearch,
  },
  {
    numero: '03',
    titulo: 'Prepara a tua candidatura',
    descricao:
      'Organiza os documentos necessários e acompanha os próximos passos.',
    icon: Target,
  },
]

export default function HomePage() {
  return (
    <div className="overflow-hidden">
      {/* Área principal */}
      <section className="relative isolate bg-[#062c49]">
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-36 right-[-8%] h-[430px] w-[430px] rounded-full bg-[#087f78]/20 blur-3xl" />
          <div className="absolute bottom-[-180px] left-[20%] h-[350px] w-[350px] rounded-full bg-sky-500/10 blur-3xl" />
          <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(rgba(255,255,255,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.5)_1px,transparent_1px)] [background-size:44px_44px]" />
        </div>

        <div className="mx-auto grid min-h-[620px] max-w-7xl items-center gap-10 px-5 py-12 sm:px-8 sm:py-14 lg:min-h-[600px] lg:grid-cols-[1.05fr_0.95fr] lg:gap-12 lg:py-12">
          {/* Texto principal */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-sky-100">
              <span className="h-2 w-2 rounded-full bg-[#36c5a8]" />
              O teu próximo passo começa aqui
            </div>

            <h1 className="mt-4 max-w-2xl text-3xl leading-[1.12] font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
              Oportunidades para estudar.
              <span className="mt-1.5 block text-[#54d7b7]">
                Possibilidades para crescer.
              </span>
            </h1>

            <p className="mt-4 max-w-xl text-sm leading-6 text-sky-100/80 sm:text-base sm:leading-7">
              Descobre oportunidades de bolsas de estudo, conhece os requisitos
              e prepara o teu percurso académico com mais informação e organização.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/oportunidades"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#079b83] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-black/10 transition hover:bg-[#078672]"
              >
                Explorar oportunidades
                <ArrowRight size={17} />
              </Link>

              <Link
                to="/registo"
                className="inline-flex items-center justify-center rounded-lg border border-white/20 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Criar conta gratuita
              </Link>
            </div>

            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-3 text-xs text-sky-100/75">
              <span className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-[#54d7b7]" />
                Informação organizada
              </span>

              <span className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-[#54d7b7]" />
                Consulta de requisitos
              </span>
            </div>
          </div>

          {/* Cartão de pesquisa */}
          <div className="relative mx-auto w-full max-w-md lg:ml-auto">
            <div className="absolute -inset-3 rounded-3xl bg-[#079b83]/10 blur-2xl" />

            <div className="relative rounded-2xl border border-white/15 bg-white p-5 shadow-2xl shadow-slate-950/20 sm:p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold tracking-wide text-[#087f78] uppercase">
                    Começa a tua pesquisa
                  </p>

                  <h2 className="mt-2 text-xl font-bold tracking-tight text-[#073451] sm:text-2xl">
                    Encontra o teu caminho
                  </h2>

                  <p className="mt-2 text-sm leading-5 text-slate-500">
                    Explora as oportunidades e identifica as que correspondem
                    aos teus objectivos.
                  </p>
                </div>

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e7f6f2] text-[#087f78]">
                  <Search size={21} />
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <div>
                  <label
                    htmlFor="pesquisa-oportunidades"
                    className="mb-1.5 block text-xs font-semibold text-slate-700"
                  >
                    O que procuras?
                  </label>

                  <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-[#f8fafc] px-3">
                    <Search size={17} className="shrink-0 text-slate-400" />

                    <input
                      id="pesquisa-oportunidades"
                      type="search"
                      placeholder="Ex.: licenciatura, mestrado..."
                      className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <Link
                  to="/oportunidades"
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#073451] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#0b4668]"
                >
                  Consultar oportunidades
                  <ArrowRight size={16} />
                </Link>
              </div>

              <div className="mt-4 flex items-start gap-3 rounded-lg bg-[#f0f8f6] p-3">
                <Compass
                  size={18}
                  className="mt-0.5 shrink-0 text-[#087f78]"
                />

                <p className="text-xs leading-5 text-slate-600">
                  Antes de te candidatares, confirma sempre os requisitos,
                  os prazos e as condições definidos pela entidade responsável.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categorias */}
      <section className="bg-[#f5f8fb] py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold tracking-[0.15em] text-[#087f78] uppercase">
                Explora por categoria
              </p>

              <h2 className="mt-3 text-2xl font-bold tracking-tight text-[#073451] sm:text-3xl">
                Que oportunidade procuras?
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                Começa pela área que corresponde aos teus objectivos académicos
                ou profissionais.
              </p>
            </div>

            <Link
              to="/oportunidades"
              className="inline-flex items-center gap-2 self-start text-sm font-semibold text-[#087f78] transition hover:text-[#065e58] sm:self-auto"
            >
              Ver todas as oportunidades
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {categorias.map((categoria) => {
              const Icon = categoria.icon

              return (
                <Link
                  key={categoria.titulo}
                  to="/oportunidades"
                  className="group rounded-xl border border-slate-200/80 bg-white p-5 transition hover:-translate-y-1 hover:border-[#a5dcd0] hover:shadow-lg hover:shadow-slate-900/5"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#e9f6f3] text-[#087f78] transition group-hover:bg-[#087f78] group-hover:text-white">
                    <Icon size={23} strokeWidth={1.8} />
                  </div>

                  <h3 className="mt-5 text-sm font-bold text-[#073451]">
                    {categoria.titulo}
                  </h3>

                  <p className="mt-2 min-h-10 text-xs leading-5 text-slate-500">
                    {categoria.descricao}
                  </p>

                  <span className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-[#087f78]">
                    Explorar
                    <ArrowRight
                      size={14}
                      className="transition group-hover:translate-x-1"
                    />
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Como funciona */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold tracking-[0.15em] text-[#087f78] uppercase">
              Como funciona
            </p>

            <h2 className="mt-3 text-2xl font-bold tracking-tight text-[#073451] sm:text-3xl">
              Três passos para começares
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base">
              Organiza a tua procura e prepara-te para aproveitar as oportunidades
              adequadas ao teu percurso.
            </p>
          </div>

          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {etapas.map((etapa) => {
              const Icon = etapa.icon

              return (
                <article key={etapa.numero} className="relative">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#073451] text-white">
                      <Icon size={22} />
                    </div>

                    <span className="text-3xl font-bold text-slate-200">
                      {etapa.numero}
                    </span>
                  </div>

                  <h3 className="mt-5 text-base font-bold text-[#073451]">
                    {etapa.titulo}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {etapa.descricao}
                  </p>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      {/* Chamada final */}
      <section className="px-5 pb-12 sm:px-8 sm:pb-16">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-2xl bg-[#073451] px-6 py-9 sm:px-14 sm:py-12 lg:px-14">
          <div className="pointer-events-none absolute -right-10 -bottom-32 h-72 w-72 rounded-full bg-[#079b83]/20 blur-2xl" />

          <div className="relative flex flex-col gap-7 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                O próximo passo do teu percurso pode começar hoje.
              </h2>

              <p className="mt-3 text-sm leading-6 text-sky-100/75 sm:text-base">
                Cria a tua conta e começa a organizar a procura por oportunidades
                de formação.
              </p>
            </div>

            <Link
              to="/registo"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[#079b83] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#078672]"
            >
              Criar a minha conta
              <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}