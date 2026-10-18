import { Link } from 'react-router-dom'

export default function NaoEncontradoPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 text-center">
      <p className="text-sm font-semibold text-teal-700">Erro 404</p>

      <h1 className="mt-3 text-4xl font-bold text-slate-900">
        Página não encontrada
      </h1>

      <p className="mt-4 text-slate-600">
        O endereço que procuras não corresponde a uma página disponível.
      </p>

      <Link
        to="/"
        className="mt-8 rounded-lg bg-blue-900 px-5 py-3 font-semibold text-white"
      >
        Voltar ao início
      </Link>
    </main>
  )
}