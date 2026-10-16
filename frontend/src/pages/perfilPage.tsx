import React, { useEffect, useState } from 'react';
import { obterPerfilProprio, atualizarPerfilProprio, type PerfilCandidato } from '../services/perfis.api';

export function PerfilPage() {
  const [perfil, setPerfil] = useState<PerfilCandidato>({
    nacionalidade_codigo: '',
    nivel_ensino_atual: '',
    area_estudo: '',
    instituicao_ensino: '',
    pais_destino_preferido: '',
  });
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    async function carregarPerfil() {
      try {
        const resposta = await obterPerfilProprio();
        if (resposta.data) {
          setPerfil(resposta.data);
        }
      } catch (err: any) {
        setErro('Não foi possível carregar o perfil.');
      }
    }
    carregarPerfil();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensagem(null);
    setErro(null);
    setCarregando(true);

    try {
      await atualizarPerfilProprio(perfil);
      setMensagem('Perfil atualizado com sucesso!');
    } catch (err: any) {
      setErro('Erro ao atualizar o perfil.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow mt-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Perfil Académico</h2>

      {mensagem && <div className="p-3 mb-4 text-green-700 bg-green-100 rounded">{mensagem}</div>}
      {erro && <div className="p-3 mb-4 text-red-700 bg-red-100 rounded">{erro}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nacionalidade (ex: AO)</label>
          <input
            type="text"
            value={perfil.nacionalidade_codigo || ''}
            onChange={(e) => setPerfil({ ...perfil, nacionalidade_codigo: e.target.value })}
            className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500"
            placeholder="AO"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nível de Ensino Atual</label>
          <input
            type="text"
            value={perfil.nivel_ensino_atual || ''}
            onChange={(e) => setPerfil({ ...perfil, nivel_ensino_atual: e.target.value })}
            className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500"
            placeholder="Ex: Licenciatura, Ensino Médio"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Área de Estudo</label>
          <input
            type="text"
            value={perfil.area_estudo || ''}
            onChange={(e) => setPerfil({ ...perfil, area_estudo: e.target.value })}
            className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500"
            placeholder="Ex: Engenharia Informática, Saúde"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Instituição de Ensino</label>
          <input
            type="text"
            value={perfil.instituicao_ensino || ''}
            onChange={(e) => setPerfil({ ...perfil, instituicao_ensino: e.target.value })}
            className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">País de Destino Preferido</label>
          <input
            type="text"
            value={perfil.pais_destino_preferido || ''}
            onChange={(e) => setPerfil({ ...perfil, pais_destino_preferido: e.target.value })}
            className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={carregando}
          className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 disabled:opacity-50"
        >
          {carregando ? 'A guardar...' : 'Guardar Perfil'}
        </button>
      </form>
    </div>
  );
}