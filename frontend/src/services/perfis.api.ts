import { apiFetch } from './api';

export interface PerfilCandidato {
  nacionalidade_codigo?: string;
  nivel_ensino_atual?: string;
  area_estudo?: string;
  instituicao_ensino?: string;
  pais_destino_preferido?: string;
}

export async function obterPerfilProprio() {
  return apiFetch<{ data: PerfilCandidato }>('/perfis/me', { method: 'GET' });
}

export async function atualizarPerfilProprio(dados: PerfilCandidato) {
  return apiFetch<{ data: PerfilCandidato }>('/perfis/me', {
    method: 'PUT',
    body: JSON.stringify(dados),
  });
}