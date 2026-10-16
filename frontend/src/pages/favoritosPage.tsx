import { useEffect, useState } from 'react';
import { obterFavoritos, removerFavorito, type Favorito } from '../services/favoritos.api';

export function FavoritosPage() {
  const [favoritos, setFavoritos] = useState<Favorito[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    carregarFavoritos();
  }, []);

  async function carregarFavoritos() {
    try {
      setCarregando(true);
      const resposta = await obterFavoritos();
      if (resposta.data) {
        setFavoritos(resposta.data);
      }
    } catch (err: any) {
      setErro('Não foi possível carregar os favoritos.');
    } finally {
      setCarregando(false);
    }
  }

  const handleRemover = async (oportunidadeId: string) => {
    try {
      await removerFavorito(oportunidadeId);
      setFavoritos(favoritos.filter((fav) => fav.oportunidade_id !== oportunidadeId));
    } catch (err: any) {
      alert('Erro ao remover dos favoritos.');
    }
  };

  if (carregando) {
    return <div className="text-center p-8">A carregar os teus favoritos...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow mt-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Minhas Bolsas Favoritas</h2>

      {erro && <div className="p-3 mb-4 text-red-700 bg-red-100 rounded">{erro}</div>}

      {favoritos.length === 0 ? (
        <p className="text-gray-500">Ainda não guardaste nenhuma bolsa nos teus favoritos.</p>
      ) : (
        <div className="space-y-4">
          {favoritos.map((fav) => (
            <div key={fav.id} className="border p-4 rounded flex justify-between items-center shadow-sm">
              <div>
                <h3 className="font-semibold text-lg text-blue-600">
                  {fav.oportunidades?.titulo || 'Oportunidade de Bolsa'}
                </h3>
                <p className="text-sm text-gray-600">
                  {fav.oportunidades?.instituicao || 'Instituição de ensino'}
                </p>
              </div>
              <button
                onClick={() => handleRemover(fav.oportunidade_id)}
                className="bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1 rounded text-sm font-medium border border-red-200"
              >
                Remover
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}