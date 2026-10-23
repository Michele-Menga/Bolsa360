import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registar } from '../services/autenticacao.api';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [palavraPasse, setPalavraPasse] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  // Validação client-side antes de chamar a API
  const validarFormulario = (): boolean => {
    if (!nome.trim() || !email.trim() || !palavraPasse.trim()) {
      setErro('Por favor, preencha todos os campos obrigatórios.');
      return false;
    }

    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regexEmail.test(email)) {
      setErro('Insira um endereço de e-mail válido.');
      return false;
    }

    // Regra da API: mínimo 8 caracteres, maiúscula, número e símbolo
    const regexSenhaForte = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
    if (!regexSenhaForte.test(palavraPasse)) {
      setErro(
        'A palavra-passe deve ter pelo menos 8 caracteres, incluindo 1 letra maiúscula, 1 número e 1 caractere especial (ex: @, #, !).'
      );
      return false;
    }

    setErro(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validarFormulario()) return;

    setCarregando(true);
    try {
      await registar({
        nome: nome.trim(),
        email: email.trim().toLowerCase(),
        palavraPasse: palavraPasse,
      });

      navigate('/login');
    } catch (err: any) {
      setErro(err.message || 'Falha ao criar conta. Verifique os dados inseridos.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h2 className="mb-6 text-center text-2xl font-bold text-gray-900">
          Criar Conta no Bolsa360
        </h2>

        {erro && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-200">
            {erro}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nome Completo</label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm focus:border-blue-500 focus:outline-none"
              placeholder="Ex: Adianeth Prazeres"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm focus:border-blue-500 focus:outline-none"
              placeholder="exemplo@dominio.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Palavra-passe</label>
            <input
              type="password"
              value={palavraPasse}
              onChange={(e) => setPalavraPasse(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm focus:border-blue-500 focus:outline-none"
              placeholder="Mínimo 8 caracteres (Ex: Bolsa360#2026)"
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              Requisitos: Mínimo 8 caracteres, 1 maiúscula, 1 número e 1 símbolo.
            </p>
          </div>

          <button
            type="submit"
            disabled={carregando}
            className="w-full rounded-md bg-blue-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
          >
            {carregando ? 'A processar...' : 'Registar'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Já tem uma conta?{' '}
          <Link to="/login" className="font-semibold text-blue-600 hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
};