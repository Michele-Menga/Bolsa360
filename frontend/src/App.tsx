import { useState } from 'react'

const bolsas = [
  {
    id: 1,
    titulo: 'Bolsa de Estudos para Licenciatura',
    instituicao: 'Programa de Bolsas Académicas',
    categoria: 'Licenciatura',
    local: 'Internacional',
    prazo: '30 Nov, 2026',
    financiamento: 'Financiamento integral',
    cor: 'bg-blue-100 text-blue-700',
    sigla: 'BA',
  },
  {
    id: 2,
    titulo: 'Bolsa para Mestrado Internacional',
    instituicao: 'Programa de Desenvolvimento Académico',
    categoria: 'Mestrado',
    local: 'Europa',
    prazo: '15 Dez, 2026',
    financiamento: 'Propinas e subsídio',
    cor: 'bg-violet-100 text-violet-700',
    sigla: 'MA',
  },
  {
    id: 3,
    titulo: 'Programa de Formação Tecnológica',
    instituicao: 'Iniciativa de Capacitação Digital',
    categoria: 'Formação',
    local: 'Online',
    prazo: '10 Jan, 2027',
    financiamento: 'Formação gratuita',
    cor: 'bg-emerald-100 text-emerald-700',
    sigla: 'FT',
  },
]

const categorias = [
  { nome: 'Licenciatura', descricao: 'Para quem quer iniciar a universidade', simbolo: '🎓' },
  { nome: 'Mestrado', descricao: 'Continua a tua formação académica', simbolo: '📚' },
  { nome: 'Doutoramento', descricao: 'Aprofunda a tua investigação', simbolo: '🔬' },
  { nome: 'Formação', descricao: 'Desenvolve novas competências', simbolo: '💡' },
]

function App() {
  const [pesquisa, setPesquisa] = useState('')
  const [categoria, setCategoria] = useState('Todas')
  const [menuAberto, setMenuAberto] = useState(false)

  const bolsasFiltradas = bolsas.filter((bolsa) => {
    const correspondePesquisa =
      `${bolsa.titulo} ${bolsa.instituicao} ${bolsa.local}`
        .toLowerCase()
        .includes(pesquisa.toLowerCase())

    const correspondeCategoria =
      categoria === 'Todas' || bolsa.categoria === categoria

    return correspondePesquisa && correspondeCategoria
  })

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Navegação */}
      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <a href="#" className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-700 text-xl font-bold text-white">
              B
            </div>
            <div>
              <span className="block text-xl font-extrabold tracking-tight">
                Bolsa<span className="text-blue-700">360</span>
              </span>
              <span className="block text-[10px] font-medium tracking-widest text-slate-500">
                OPORTUNIDADES SEM LIMITES
              </span>
            </div>
          </a>

          <nav className="hidden items-center gap-8 md:flex">
            <a href="#bolsas" className="text-sm font-medium text-slate-600 transition hover:text-blue-700">
              Explorar bolsas
            </a>
            <a href="#categorias" className="text-sm font-medium text-slate-600 transition hover:text-blue-700">
              Categorias
            </a>
            <a href="#como-funciona" className="text-sm font-medium text-slate-600 transition hover:text-blue-700">
              Como funciona
            </a>
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <button
              onClick={() => alert('A autenticação será implementada numa próxima etapa.')}
              className="rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Entrar
            </button>
            <button
              onClick={() => alert('O registo de utilizadores será implementado numa próxima etapa.')}
              className="rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800"
            >
              Criar conta
            </button>
          </div>

          <button
            onClick={() => setMenuAberto(!menuAberto)}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold md:hidden"
            aria-label="Abrir menu"
            aria-expanded={menuAberto}
          >
            {menuAberto ? 'Fechar' : 'Menu'}
          </button>
        </div>

        {menuAberto && (
          <nav className="flex flex-col gap-1 border-t border-slate-100 px-5 py-4 md:hidden">
            <a onClick={() => setMenuAberto(false)} href="#bolsas" className="rounded-lg px-3 py-3 text-sm hover:bg-slate-50">
              Explorar bolsas
            </a>
            <a onClick={() => setMenuAberto(false)} href="#categorias" className="rounded-lg px-3 py-3 text-sm hover:bg-slate-50">
              Categorias
            </a>
            <a onClick={() => setMenuAberto(false)} href="#como-funciona" className="rounded-lg px-3 py-3 text-sm hover:bg-slate-50">
              Como funciona
            </a>
          </nav>
        )}
      </header>

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden bg-slate-50">
          <div className="pointer-events-none absolute -right-32 -top-40 h-96 w-96 rounded-full bg-blue-100/70 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-40 left-0 h-80 w-80 rounded-full bg-indigo-100/60 blur-3xl" />

          <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 sm:py-20 lg:grid-cols-2 lg:px-8 lg:py-28">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-4 py-2 text-sm font-medium text-blue-800 shadow-sm">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                O teu futuro começa com uma oportunidade
              </div>

              <h1 className="max-w-2xl text-4xl font-extrabold leading-tight tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
                O próximo passo da tua carreira{' '}
                <span className="text-blue-700">começa aqui.</span>
              </h1>

              <p className="mt-6 max-w-xl text-base leading-8 text-slate-600 sm:text-lg">
                Descobre bolsas de estudo, programas de formação e oportunidades
                académicas para transformares os teus objectivos em realidade.
              </p>

              <form
                onSubmit={(event) => {
                  event.preventDefault()
                  document.getElementById('bolsas')?.scrollIntoView({ behavior: 'smooth' })
                }}
                className="mt-9 flex max-w-xl flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-lg shadow-slate-200/50 sm:flex-row"
              >
                <div className="flex flex-1 items-center gap-3 px-3">
                  <svg className="h-5 w-5 shrink-0 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="7" strokeWidth="2" />
                    <path d="m16 16 4 4" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  <input
                    value={pesquisa}
                    onChange={(event) => setPesquisa(event.target.value)}
                    placeholder="Ex.: bolsa para licenciatura..."
                    className="w-full bg-transparent py-2 text-sm outline-none placeholder:text-slate-400"
                    aria-label="Pesquisar oportunidades"
                  />
                </div>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-700 px-6 py-3 font-semibold text-white transition hover:bg-blue-800"
                >
                  Encontrar bolsas
                </button>
              </form>

              <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-slate-500">
                <span className="flex items-center gap-2">
                  <span className="font-bold text-emerald-600">✓</span>
                  Pesquisa gratuita
                </span>
                <span className="flex items-center gap-2">
                  <span className="font-bold text-emerald-600">✓</span>
                  Várias áreas de estudo
                </span>
              </div>
            </div>

            {/* Painel visual */}
            <div className="relative mx-auto w-full max-w-lg">
              <div className="absolute -left-5 top-12 h-24 w-24 rounded-3xl bg-blue-200/60 blur-2xl" />
              <div className="absolute -right-4 bottom-10 h-28 w-28 rounded-full bg-indigo-200/60 blur-2xl" />

              <div className="relative rounded-3xl border border-slate-200/80 bg-white p-5 shadow-2xl shadow-blue-950/10 sm:p-7">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Oportunidades</p>
                    <h2 className="mt-1 text-xl font-bold">Explora o teu futuro</h2>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-2xl">
                    🎓
                  </div>
                </div>

                <div className="mt-7 space-y-4">
                  <div className="flex items-center gap-4 rounded-2xl border border-slate-100 p-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-xl">
                      🌍
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold">Estudar no estrangeiro</p>
                      <p className="mt-1 text-sm text-slate-500">Descobre novos destinos</p>
                    </div>
                    <span className="text-xl text-slate-300">→</span>
                  </div>

                  <div className="flex items-center gap-4 rounded-2xl border border-slate-100 p-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-xl">
                      💻
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold">Desenvolver competências</p>
                      <p className="mt-1 text-sm text-slate-500">Investe no teu talento</p>
                    </div>
                    <span className="text-xl text-slate-300">→</span>
                  </div>

                  <div className="flex items-center gap-4 rounded-2xl border border-slate-100 p-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-xl">
                      📖
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold">Continuar os estudos</p>
                      <p className="mt-1 text-sm text-slate-500">Vai mais longe na tua formação</p>
                    </div>
                    <span className="text-xl text-slate-300">→</span>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl bg-blue-700 p-5 text-white">
                  <p className="text-sm text-blue-100">A tua próxima oportunidade</p>
                  <p className="mt-1 text-lg font-bold">Pode estar mais perto do que imaginas.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Indicadores */}
        <section className="border-y border-slate-100 bg-white">
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-5 py-9 sm:grid-cols-4 lg:px-8">
            {[
              { valor: 'Bolsas', texto: 'Oportunidades académicas' },
              { valor: 'Global', texto: 'Pesquisa de oportunidades' },
              { valor: 'Gratuito', texto: 'Acesso à plataforma' },
              { valor: '360°', texto: 'O teu futuro em foco' },
            ].map((item) => (
              <div key={item.valor} className="text-center">
                <p className="text-xl font-extrabold text-blue-700 sm:text-2xl">{item.valor}</p>
                <p className="mt-1 text-xs text-slate-500 sm:text-sm">{item.texto}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Categorias */}
        <section id="categorias" className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-20">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-blue-700">Explora por área</p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
                Oportunidades para cada etapa
              </h2>
              <p className="mt-3 max-w-xl leading-7 text-slate-500">
                Encontra programas alinhados com o teu percurso académico e os teus objectivos.
              </p>
            </div>
          </div>

          <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categorias.map((item) => (
              <button
                key={item.nome}
                onClick={() => {
                  setCategoria(item.nome)
                  document.getElementById('bolsas')?.scrollIntoView({ behavior: 'smooth' })
                }}
                className="group rounded-2xl border border-slate-200 bg-white p-6 text-left transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-950/5"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-2xl transition group-hover:bg-blue-100">
                  {item.simbolo}
                </div>
                <h3 className="mt-5 text-lg font-bold">{item.nome}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">{item.descricao}</p>
                <span className="mt-5 inline-block text-sm font-semibold text-blue-700">
                  Explorar oportunidades →
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* Bolsas */}
        <section id="bolsas" className="bg-slate-50 py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div>
                <p className="text-sm font-bold uppercase tracking-widest text-blue-700">Descobre oportunidades</p>
                <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
                  Bolsas em destaque
                </h2>
                <p className="mt-3 text-slate-500">
                  Explora as oportunidades que reunimos para ti.
                </p>
              </div>

              <button
                onClick={() => {
                  setCategoria('Todas')
                  setPesquisa('')
                }}
                className="self-start rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold transition hover:border-blue-300 sm:self-auto"
              >
                Limpar filtros
              </button>
            </div>

            <div className="mt-7 flex flex-wrap gap-2">
              {['Todas', 'Licenciatura', 'Mestrado', 'Doutoramento', 'Formação'].map((item) => (
                <button
                  key={item}
                  onClick={() => setCategoria(item)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    categoria === item
                      ? 'bg-blue-700 text-white'
                      : 'border border-slate-200 bg-white text-slate-600 hover:border-blue-300'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>

            <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {bolsasFiltradas.length > 0 ? (
                bolsasFiltradas.map((bolsa) => (
                  <article
                    key={bolsa.id}
                    className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-900/5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-xl text-sm font-extrabold ${bolsa.cor}`}>
                        {bolsa.sigla}
                      </div>
                      <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                        {bolsa.financiamento}
                      </span>
                    </div>

                    <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                      {bolsa.instituicao}
                    </p>
                    <h3 className="mt-2 text-xl font-bold leading-snug">{bolsa.titulo}</h3>

                    <div className="mt-5 space-y-3 text-sm text-slate-500">
                      <p className="flex items-center gap-2">
                        <span>📍</span> {bolsa.local}
                      </p>
                      <p className="flex items-center gap-2">
                        <span>📚</span> {bolsa.categoria}
                      </p>
                      <p className="flex items-center gap-2">
                        <span>📅</span> Prazo indicativo: {bolsa.prazo}
                      </p>
                    </div>

                    <button
                      onClick={() => alert('Os detalhes e a candidatura serão implementados nas próximas etapas.')}
                      className="mt-7 w-full rounded-xl border border-blue-200 py-3 text-sm font-bold text-blue-700 transition hover:bg-blue-700 hover:text-white"
                    >
                      Ver oportunidade →
                    </button>
                  </article>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center md:col-span-2 lg:col-span-3">
                  <p className="text-lg font-bold">Nenhuma oportunidade encontrada</p>
                  <p className="mt-2 text-sm text-slate-500">
                    Experimenta outra pesquisa ou selecciona uma categoria diferente.
                  </p>
                  <button
                    onClick={() => {
                      setPesquisa('')
                      setCategoria('Todas')
                    }}
                    className="mt-5 font-semibold text-blue-700"
                  >
                    Limpar pesquisa
                  </button>
                </div>
              )}
            </div>

            <p className="mt-6 text-xs leading-5 text-slate-400">
              Nota: as oportunidades acima são dados demonstrativos para desenvolvimento.
              Os prazos e financiamentos ainda não foram verificados e não devem ser
              considerados ofertas reais.
            </p>
          </div>
        </section>

        {/* Como funciona */}
        <section id="como-funciona" className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-blue-700">Simples e acessível</p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
              O teu caminho começa em três passos
            </h2>
            <p className="mt-4 leading-7 text-slate-500">
              Organiza a tua pesquisa e prepara-te para aproveitar novas oportunidades.
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {[
              { numero: '01', titulo: 'Descobre', texto: 'Pesquisa bolsas e programas de acordo com o teu nível académico.' },
              { numero: '02', titulo: 'Compara', texto: 'Analisa os requisitos, os prazos e as condições de cada oportunidade.' },
              { numero: '03', titulo: 'Prepara-te', texto: 'Organiza os teus documentos e prepara a tua candidatura.' },
            ].map((item) => (
              <div key={item.numero} className="rounded-2xl border border-slate-100 p-7">
                <span className="text-4xl font-extrabold text-blue-100">{item.numero}</span>
                <h3 className="mt-5 text-xl font-bold">{item.titulo}</h3>
                <p className="mt-3 leading-7 text-slate-500">{item.texto}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Chamada para acção */}
        <section className="px-5 pb-16 lg:px-8 lg:pb-20">
          <div className="mx-auto max-w-7xl overflow-hidden rounded-3xl bg-blue-700 px-6 py-12 text-white sm:px-12 sm:py-16">
            <div className="flex flex-col justify-between gap-8 md:flex-row md:items-center">
              <div className="max-w-2xl">
                <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                  O teu futuro merece uma oportunidade.
                </h2>
                <p className="mt-4 leading-7 text-blue-100">
                  Começa a explorar possibilidades para a tua formação e os teus próximos passos.
                </p>
              </div>
              <a
                href="#bolsas"
                className="inline-flex shrink-0 items-center justify-center rounded-xl bg-white px-6 py-3.5 font-bold text-blue-700 transition hover:bg-blue-50"
              >
                Explorar bolsas →
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* Rodapé */}
      <footer className="border-t border-slate-100 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-8 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <div>
            <p className="text-lg font-extrabold">
              Bolsa<span className="text-blue-700">360</span>
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Mais informação. Mais oportunidades. Mais futuro.
            </p>
          </div>
          <p className="text-sm text-slate-400">
            © {new Date().getFullYear()} Bolsa360. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App