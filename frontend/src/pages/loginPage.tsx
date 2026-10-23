import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/autenticacao.api';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [palavraPasse, setPalavraPasse] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);
    setCarregando(true);

    try {
      await login({ email, palavraPasse: palavraPasse });
      // Se o login der certo, redireciona para o catálogo de oportunidades
      navigate('/oportunidades');
    } catch (err: any) {
      setErro(err.message || 'Falha ao iniciar sessão. Verifique as credenciais.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Iniciar Sessão</h2>
      
      {erro && <div className="p-2 mb-4 text-red-600 bg-red-100 rounded">{erro}</div>}

      <div className="mb-4">
        <label className="block mb-1">E-mail</label>
        <input 
          type="email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required 
          className="w-full border p-2 rounded"
        />
      </div>

      <div className="mb-4">
        <label className="block mb-1">Palavra-passe</label>
        <input 
          type="password" 
          value={palavraPasse} 
          onChange={(e) => setPalavraPasse(e.target.value)} 
          required 
          className="w-full border p-2 rounded"
        />
      </div>

      <button 
        type="submit" 
        disabled={carregando}
        className="w-full bg-blue-600 text-white py-2 rounded font-semibold disabled:opacity-50"
      >
        {carregando ? 'A entrar...' : 'Entrar'}
      </button>
    </form>
  );
}