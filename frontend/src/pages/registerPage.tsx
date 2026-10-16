import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registar } from '../services/autenticacao.api';

export function RegisterPage() {
  const [nome, setNome] = useState('');
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
      await registar({ nome, email, palavra_passe: palavraPasse });
      // Após criar conta com sucesso, redireciona para o login ou oportunidades
      navigate('/login');
    } catch (err: any) {
      setErro(err.message || 'Erro ao criar conta. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Criar Conta no Bolsa360</h2>
      
      {erro && <div className="p-2 mb-4 text-red-600 bg-red-100 rounded">{erro}</div>}

      <div className="mb-4">
        <label className="block mb-1">Nome Completo</label>
        <input 
          type="text" 
          value={nome} 
          onChange={(e) => setNome(e.target.value)} 
          required 
          className="w-full border p-2 rounded"
        />
      </div>

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
        {carregando ? 'A criar conta...' : 'Registar'}
      </button>
    </form>
  );
}