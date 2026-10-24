import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "./api";
import { useAuth } from "@/auth/AuthContext";
import type {
  Candidatura, EstadoCandidatura, Favorito, Metricas, Oportunidade, OportunidadeAdmin, OportunidadeAdminDetalhe, OportunidadeDetalhe, Pagina, Perfil, Referencias,
} from "./types";

export type Filtros = Record<string, string | undefined>;

export const useOportunidades = (f: Filtros) =>
  useQuery({ queryKey: ["oportunidades", f], queryFn: () => api.get<Pagina<Oportunidade>>("/oportunidades", f), placeholderData: keepPreviousData });

export const useOportunidade = (id?: string) =>
  useQuery({ queryKey: ["oportunidade", id], enabled: !!id, queryFn: async () => (await api.get<{ data: OportunidadeDetalhe }>(`/oportunidades/${id}`)).data });

// Listas de apoio (tipos, níveis, categorias): quase estáticas, por isso cache longa.
export const useReferencias = () =>
  useQuery({
    queryKey: ["referencias"], staleTime: 60 * 60_000, gcTime: 24 * 60 * 60_000,
    queryFn: async () => (await api.get<{ data: Referencias }>("/referencias")).data,
  });

// Favoritos, candidaturas e perfil são só do candidato: ADMIN e MENTOR não os pedem (evita pedidos inúteis).
export function useFavoritos() {
  const { user } = useAuth();
  return useQuery({ queryKey: ["favoritos"], enabled: user?.papel === "CANDIDATO", queryFn: async () => (await api.get<{ data: Favorito[] }>("/favoritos")).data });
}
export function useToggleFavorito() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ativo }: { id: string; ativo: boolean }) => (ativo ? api.del(`/favoritos/${id}`) : api.post(`/favoritos/${id}`)),
    onSettled: () => qc.invalidateQueries({ queryKey: ["favoritos"] }),
  });
}

export function useCandidaturas() {
  const { user } = useAuth();
  return useQuery({ queryKey: ["candidaturas"], enabled: user?.papel === "CANDIDATO", queryFn: async () => (await api.get<{ data: Candidatura[] }>("/candidaturas")).data });
}
export const useCandidatura = (id?: string) =>
  useQuery({ queryKey: ["candidatura", id], enabled: !!id, queryFn: async () => (await api.get<{ data: Candidatura }>(`/candidaturas/${id}`)).data });
export function useCriarCandidatura() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (oportunidadeId: string) => api.post<{ data: Candidatura }>("/candidaturas", { oportunidadeId }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["candidaturas"] }),
  });
}
export function useAtualizarCandidatura() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...b }: { id: string; estado: EstadoCandidatura; notasPrivadas?: string; observacao?: string }) =>
      api.patch(`/candidaturas/${id}`, b),
    onSuccess: (_d, v) => { qc.invalidateQueries({ queryKey: ["candidaturas"] }); qc.invalidateQueries({ queryKey: ["candidatura", v.id] }); },
  });
}

export const usePerfil = (ativo: boolean) =>
  useQuery({
    queryKey: ["perfil"], enabled: ativo, retry: false,
    queryFn: async () => {
      try { return (await api.get<{ data: Perfil }>("/perfis/me")).data; }
      catch (e: any) { if (e?.codigo === "PERFIL_NAO_ENCONTRADO") return null; throw e; }
    },
  });
export function useGuardarPerfil() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (b: unknown) => api.put<{ data: Perfil }>("/perfis/me", b), onSuccess: () => qc.invalidateQueries({ queryKey: ["perfil"] }) });
}

export const useMetricas = () => useQuery({ queryKey: ["metricas"], queryFn: async () => (await api.get<{ data: Metricas }>("/admin/metricas")).data });
export const useOportunidadeAdmin = (id?: string) =>
  useQuery({
    queryKey: ["admin-oportunidade", id], enabled: !!id, staleTime: 0, gcTime: 0,
    queryFn: async () => (await api.get<{ data: OportunidadeAdminDetalhe }>(`/admin/oportunidades/${id}`)).data,
  });
export const useOportunidadesAdmin = (f: Filtros) =>
  useQuery({ queryKey: ["admin-oportunidades", f], queryFn: () => api.get<Pagina<OportunidadeAdmin>>("/admin/oportunidades", f), placeholderData: keepPreviousData });
export function useAdminAcao() {
  const qc = useQueryClient();
  // Publicar/arquivar/editar muda o catálogo público, o detalhe público e os favoritos/candidaturas que o mostram.
  const refrescar = () => {
    for (const k of ["admin-oportunidades", "admin-oportunidade", "metricas", "oportunidades", "oportunidade", "favoritos", "candidaturas"]) qc.invalidateQueries({ queryKey: [k] });
  };
  return {
    criar: useMutation({ mutationFn: (b: unknown) => api.post("/admin/oportunidades", b), onSuccess: refrescar }),
    atualizar: useMutation({ mutationFn: ({ id, ...b }: any) => api.patch(`/admin/oportunidades/${id}`, b), onSuccess: refrescar }),
    publicar: useMutation({ mutationFn: (id: string) => api.post(`/admin/oportunidades/${id}/publicar`), onSuccess: refrescar }),
    arquivar: useMutation({ mutationFn: (id: string) => api.post(`/admin/oportunidades/${id}/arquivar`), onSuccess: refrescar }),
  };
}
