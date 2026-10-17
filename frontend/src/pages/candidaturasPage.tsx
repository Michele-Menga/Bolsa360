import { useEffect, useState } from 'react';
import { obterMinhasCandidaturas, type Candidatura } from '../services/candidaturas.api';

export function CandidaturasPage() {
  const [candidaturas, setCandidaturas] = useState<Candidatura[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    carregarCandidaturas();
  }, []);

  async function carregarCandidaturas() {
    try {
      setCarregando(true);
      const resposta = await obterMinhasCandidaturas();
      if (resposta.data) {
        setCandidaturas(resposta.data);
      }
    } catch (err: any) {
      setErro('Não foi possível carregar as tuas candidaturas.');
    } finally {
      setCarregando(false);
    }
  }

  if (carregando) {
    return <div className="text-center p-8">A carregar candidaturas...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow mt-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Minhas Candidaturas</h2>

      {erro && <div className="p-3 mb-4 text-red-700 bg-red-100 rounded">{erro}</div>}

      {candidaturas.length === 0 ? (
        <p className="text-gray-500">Ainda não te candidataste a nenhuma bolsa.</p>
      ) : (
        <div className="space-y-4">
          {candidaturas.map((cand) => (
            <div key={cand.id} className="border p-4 rounded flex justify-between items-center shadow-sm">
              <div>
                <h3 className="font-semibold text-lg text-blue-600">
                  {cand.oportunidades?.titulo || 'Bolsa de Estudo'}
                </h3>
                <p className="text-sm text-gray-600">
                  {cand.oportunidades?.instituicao || 'Instituição de ensino'}
                </p>
                {cand.data_candidatura && (
                  <span className="text-xs text-gray-400">
                    Data: {new Date(cand.data_candidatura).toLocaleDateString()}
                  </span>
                )}
              </div>
              <div>
                <span className={`px-3 py-1 rounded text-sm font-medium ${
                  cand.estado === 'Aceite' ? 'bg-green-100 text-green-800' :
                  cand.estado === 'Rejeitada' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {cand.estado || 'Pendente'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}