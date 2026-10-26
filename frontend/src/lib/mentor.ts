import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "./api";
import type { Meta } from "./types";

export type EstadoVerificacao = "PENDENTE" | "VERIFICADA" | "REJEITADA";
export type EstadoAgendamento = "PENDENTE_PAGAMENTO" | "CONFIRMADO" | "CONCLUIDO" | "CANCELADO";

export type MentorPerfil = { id: string; biografia: string; especialidades: string[]; estadoVerificacao: EstadoVerificacao; perfilCompleto: boolean; criadoEm: string };
export type Servico = {
  id: string; titulo: string; descricao: string; duracaoMinutos: number | null; preco: string; moeda: string;
  ativo: boolean; visivelParaCandidatos: boolean; criadoEm: string; atualizadoEm: string;
};
export type Sessao = {
  id: string; estado: EstadoAgendamento; inicio: string; fim: string; expiraEm: string | null;
  servico: { titulo: string; duracaoMinutos: number | null }; candidato: { nome: string };
  linkReuniao: string | null; aguardaLink: boolean; motivoCancelamento: string | null;
};
export type MentorAdmin = { id: string; nome: string; email: string; biografia: string; especialidades: string[]; estadoVerificacao: EstadoVerificacao; totalServicos: number; criadoEm: string };

export const VERIFICACAO: Record<EstadoVerificacao, string> = { PENDENTE: "Em verificação", VERIFICADA: "Verificado", REJEITADA: "Rejeitado" };
export const SESSAO: Record<EstadoAgendamento, string> = { PENDENTE_PAGAMENTO: "Solicitação Pendente", CONFIRMADO: "Confirmada", CONCLUIDO: "Concluída", CANCELADO: "Recusada / Cancelada" };
export const MOEDAS = ["AOA", "EUR", "USD", "BRL"];

export const useMentorMe = () => useQuery({ queryKey: ["mentor-me"], queryFn: async () => (await api.get<{ data: MentorPerfil }>("/mentor/me")).data });
export const useServicos = () => useQuery({ queryKey: ["mentor-servicos"], queryFn: async () => (await api.get<{ data: Servico[] }>("/mentor/servicos")).data });
export const useAgenda = (estado?: string) =>
  useQuery({ queryKey: ["mentor-agenda", estado ?? ""], queryFn: async () => (await api.get<{ data: Sessao[] }>("/mentor/agenda", { estado })).data });

export function useMentorAcoes() {
  const qc = useQueryClient();
  const inv = (...k: string[]) => () => k.forEach((x) => qc.invalidateQueries({ queryKey: [x] }));
  return {
    guardarPerfil: useMutation({ mutationFn: (b: { biografia?: string; especialidades?: string[] }) => api.put("/mentor/me", b), onSuccess: inv("mentor-me") }),
    criarServico: useMutation({ mutationFn: (b: unknown) => api.post("/mentor/servicos", b), onSuccess: inv("mentor-servicos") }),
    atualizarServico: useMutation({ mutationFn: ({ id, ...b }: { id: string } & Record<string, unknown>) => api.patch(`/mentor/servicos/${id}`, b), onSuccess: inv("mentor-servicos") }),
    aceitar: useMutation({ mutationFn: (id: string) => api.post(`/mentor/agenda/${id}/aceitar`), onSuccess: inv("mentor-agenda") }),
    recusar: useMutation({ mutationFn: ({ id, motivo }: { id: string; motivo?: string }) => api.post(`/mentor/agenda/${id}/recusar`, { motivo }), onSuccess: inv("mentor-agenda") }),
    concluir: useMutation({ mutationFn: (id: string) => api.post(`/mentor/agenda/${id}/concluir`), onSuccess: inv("mentor-agenda") }),
    cancelar: useMutation({ mutationFn: ({ id, motivo }: { id: string; motivo: string }) => api.post<{ data: { reembolsoManual: boolean } }>(`/mentor/agenda/${id}/cancelar`, { motivo }), onSuccess: inv("mentor-agenda") }),
  };
}

export const useMentoresAdmin = (estado: string, pagina: number) =>
  useQuery({
    queryKey: ["admin-mentores", estado, pagina], placeholderData: keepPreviousData,
    queryFn: () => api.get<{ data: MentorAdmin[]; meta: Meta }>("/admin/mentores", { estado: estado || undefined, pagina, limite: 8 }),
  });
export function useVerificarMentor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, estado }: { id: string; estado: EstadoVerificacao }) => api.patch(`/admin/mentores/${id}/verificacao`, { estado }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-mentores"] }),
  });
}

// ---- Estudante: Consulta de Mentores e Agendamento ----
export type ServicoMentoriaPublico = {
  id: string;
  titulo: string;
  descricao: string;
  duracaoMinutos: number | null;
  preco: string;
  moeda: string;
};

export type MentorPublico = {
  id: string;
  nome: string;
  email: string;
  biografia: string;
  especialidades: string[];
  servicos: ServicoMentoriaPublico[];
};

export type AgendamentoCandidato = {
  id: string;
  estado: EstadoAgendamento;
  inicio: string;
  fim: string;
  linkReuniao: string | null;
  motivoCancelamento: string | null;
  servico: ServicoMentoriaPublico;
  mentor: {
    id: string;
    nome: string;
    email: string;
    biografia: string;
    especialidades: string[];
  };
};

export const useMentoresPublico = (filtros?: { especialidade?: string; pesquisa?: string }) =>
  useQuery({
    queryKey: ["mentores-publico", filtros],
    queryFn: async () => (await api.get<{ data: MentorPublico[] }>("/mentores", filtros)).data,
  });

export const useMinhasMentorias = () =>
  useQuery({
    queryKey: ["minhas-mentorias"],
    queryFn: async () => (await api.get<{ data: AgendamentoCandidato[] }>("/candidato/mentorias")).data,
  });

export function useCandidatoMentoriaAcoes() {
  const qc = useQueryClient();
  return {
    agendar: useMutation({
      mutationFn: (b: { servicoId: string; inicio: string; motivo?: string }) =>
        api.post<{ data: AgendamentoCandidato }>("/candidato/mentorias/agendar", b),
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ["minhas-mentorias"] });
      },
    }),
    cancelar: useMutation({
      mutationFn: ({ id, motivo }: { id: string; motivo: string }) =>
        api.post(`/candidato/mentorias/${id}/cancelar`, { motivo }),
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ["minhas-mentorias"] });
      },
    }),
  };
}

