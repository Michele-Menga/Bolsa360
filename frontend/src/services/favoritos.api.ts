import { apiFetch } from './api';

export async function listarFavoritos() {
  return apiFetch<{ data: any[] }>('/favoritos', { method: 'GET' });
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