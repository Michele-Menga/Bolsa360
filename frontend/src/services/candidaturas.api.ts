import { apiFetch } from './api';

export interface Candidatura {
  id: string;
  oportunidade_id: string;
  estado: string;
  data_candidatura: string;
  oportunidades?: {
    titulo?: string;
    instituicao?: string;
  };
}

// Listar todas as candidaturas do candidato autenticado
export async function obterMinhasCandidaturas() {
  return apiFetch<{ data: Candidatura[] }>('/candidaturas/me', { method: 'GET' });
}

// Submeter uma nova candidatura
export async function submeterCandidatura(oportunidadeId: string) {
  return apiFetch<{ data: Candidatura }>('/candidaturas', {
    method: 'POST',
    body: JSON.stringify({ oportunidade_id: oportunidadeId }),
  });
}