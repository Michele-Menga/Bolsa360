import { apiFetch } from './api';

export async function listarCandidaturas() {
  return apiFetch<{ data: any[] }>('/candidaturas', { method: 'GET' });
}

export async function criarCandidatura(oportunidadeId: string) {
  return apiFetch<{ data: any }>('/candidaturas', {
    method: 'POST',
    body: JSON.stringify({ oportunidadeId }),
  });
}

export async function atualizarEstadoCandidatura(id: string, estado: string, notas?: string) {
  return apiFetch<{ data: any }>(`/candidaturas/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ estado, notasPrivadas: notas }),
  });
}