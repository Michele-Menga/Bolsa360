import { apiFetch } from './api';

export interface Favorito {
  id: string;
  oportunidade_id: string;
  oportunidades?: {
    titulo?: string;
    entidade_financiadora?: string;
  };
}

export async function obterFavoritos() {
  return apiFetch<{ data: Favorito[] }>('/favoritos', { method: 'GET' });
}

export async function adicionarFavorito(oportunidadeId: string) {
  return apiFetch<{ ok: boolean }>(`/favoritos/${oportunidadeId}`, {
    method: 'POST',
  });
}

export async function removerFavorito(oportunidadeId: string) {
  return apiFetch<{ ok: boolean }>(`/favoritos/${oportunidadeId}`, {
    method: 'DELETE',
  });
}