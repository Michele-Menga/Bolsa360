import { apiFetch } from './api';

export interface Candidatura {
  id: string;
  oportunidade_id: string;
  estado: string;
  criado_em: string;
  oportunidades?: {
    titulo?: string;
    entidade_financiadora?: string;
  };
}

// Listar todas as candidaturas do candidato
export async function obterMinhasCandidaturas() {
  return apiFetch<{ data: Candidatura[] }>('/candidaturas', { method: 'GET' });
}

// Submeter nova candidatura
export async function submeterCandidatura(oportunidadeId: string) {
  return apiFetch<{ data: Candidatura }>('/candidaturas', {
    method: 'POST',
    body: JSON.stringify({ oportunidade_id: oportunidadeId }),
  });
}