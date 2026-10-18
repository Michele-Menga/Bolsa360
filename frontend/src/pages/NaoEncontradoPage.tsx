import { Link } from 'react-router-dom'
import { ArrowLeft, Compass, Search } from 'lucide-react'

export default function NaoEncontradoPage() {
  return (
    <main className="flex min-h-[65vh] items-center justify-center bg-[#f5f8fb] px-5 py-16">
      <div className="w-full max-w-xl text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-[#e9f6f3] text-[#087f78]">
          <Compass size={38} strokeWidth={1.6} />
        </div>

        <p className="mt-8 text-sm font-bold tracking-[0.16em] text-[#087f78] uppercase">
          Erro 404
        </p>

        <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#073451] sm:text-4xl">
          Esta página não foi encontrada.
        </h1>

        <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-slate-500 sm:text-base">
          O endereço pode estar incorrecto ou a página pode já não estar
          disponível. Podes regressar ao início ou consultar as oportunidades.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#073451] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0b4668]"
          >
            <ArrowLeft size={16} />
            Página inicial
          </Link>

          <Link
            to="/oportunidades"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-[#073451] transition hover:bg-slate-50"
          >
            <Search size={16} />
            Explorar oportunidades
          </Link>
        </div>
      </div>
    </main>
  )
}