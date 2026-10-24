import type { EstadoCandidatura, EstadoEditorial, EstadoPrazo, Elegibilidade, Financiamento } from "./types";

export const FINANCIAMENTO: Record<Financiamento, string> = {
  INTEGRAL: "Integral", PARCIAL: "Parcial", PROPINA: "Propina", ESTIPENDIO: "Estipêndio", CURSO_GRATUITO: "Curso gratuito", OUTRO: "Outro",
};
export const PRAZO: Record<EstadoPrazo, { label: string; tom: "ok" | "warn" | "off" | "info" }> = {
  ABERTO: { label: "Aberto", tom: "ok" }, FUTURO: { label: "Abre em breve", tom: "info" },
  EXPIRADO: { label: "Expirado", tom: "off" }, SEM_PRAZO_CONFIRMADO: { label: "Prazo por confirmar", tom: "warn" },
};
export const ELEGIBILIDADE: Record<Elegibilidade, { label: string; tom: "ok" | "warn" | "off" }> = {
  ELEGIVEL: { label: "Elegível para angolanos", tom: "ok" }, POR_CONFIRMAR: { label: "Elegibilidade por confirmar", tom: "warn" },
  NAO_ELEGIVEL: { label: "Não elegível", tom: "off" },
};
export const CANDIDATURA: Record<EstadoCandidatura, string> = {
  PLANEADA: "Planeada", EM_PREPARACAO: "Em preparação", SUBMETIDA_EXTERNAMENTE: "Submetida", EM_AVALIACAO: "Em avaliação",
  ACEITE: "Aceite", REJEITADA: "Rejeitada", CANCELADA: "Cancelada",
};
export const EDITORIAL: Record<EstadoEditorial, string> = {
  RASCUNHO: "Rascunho", PENDENTE: "Pendente", VERIFICADA: "Verificada", PUBLICADA: "Publicada", REJEITADA: "Rejeitada", ARQUIVADA: "Arquivada",
};
export const MODALIDADE: Record<string, string> = { PRESENCIAL: "Presencial", ONLINE: "Online", HIBRIDA: "Híbrida", NAO_APLICAVEL: "—" };

// Tipos, níveis de ensino e categorias (com IDs) vêm de GET /referencias: ver useReferencias().
// Aqui ficam só os rótulos de apresentação que não existem na API.
export const PAISES: Record<string, string> = {
  AO: "Angola", PT: "Portugal", BR: "Brasil", CN: "China", ES: "Espanha", FR: "França", DE: "Alemanha",
  GB: "Reino Unido", US: "Estados Unidos", ZA: "África do Sul", MZ: "Moçambique", CV: "Cabo Verde", RU: "Rússia", JP: "Japão",
};
export const nomePais = (c?: string | null) => (c ? PAISES[c] ?? c : "—");

export function dinheiro(valor: string | null, moeda: string | null) {
  if (!valor) return "Valor por confirmar";
  const n = Number(valor);
  return `${n.toLocaleString("pt-AO", { maximumFractionDigits: 2 })} ${moeda ?? ""}`.trim();
}
export function data(iso: string | null | undefined) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-AO", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" });
}
/** Dias de calendário (UTC) até à data; 0 = hoje. Coincide com a regra do backend (o dia do prazo ainda é ABERTO). */
export function diasAte(iso: string | null) {
  if (!iso) return null;
  const agora = new Date();
  const hoje = Date.UTC(agora.getUTCFullYear(), agora.getUTCMonth(), agora.getUTCDate());
  return Math.round((new Date(iso).getTime() - hoje) / 86400000);
}
