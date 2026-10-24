export type EstadoPrazo =
  | "FUTURO"
  | "ABERTO"
  | "EXPIRADO"
  | "SEM_PRAZO_CONFIRMADO";

/**
 * Início do dia (00:00:00.000) em UTC.
 *
 * As colunas data_abertura e prazo_candidatura são DATE (sem hora): o Prisma
 * devolve-as como meia-noite UTC. Por isso o "hoje" tem de ser meia-noite UTC
 * e não meia-noite do fuso do servidor, senão o estado muda à hora errada
 * (Angola está em UTC+1) e deixa de coincidir com os filtros da base de dados.
 */
export function inicioDoDiaUTC(referencia: Date = new Date()): Date {
  return new Date(
    Date.UTC(
      referencia.getUTCFullYear(),
      referencia.getUTCMonth(),
      referencia.getUTCDate(),
    ),
  );
}

/**
 * Única fonte de verdade do estado do prazo (documento, secção 11.5).
 * O estado nunca é guardado: deriva sempre das datas.
 *
 * Ordem das regras (tem de ser igual à dos filtros em construirWhere):
 *  1. sem prazo                       -> SEM_PRAZO_CONFIRMADO
 *  2. prazo anterior a hoje           -> EXPIRADO  (um prazo ultrapassado nunca está aberto)
 *  3. abertura posterior a hoje       -> FUTURO
 *  4. caso contrário (inclui prazo = hoje) -> ABERTO
 */
export function calcularEstadoPrazo(
  dataAbertura: Date | null,
  prazoCandidatura: Date | null,
  hoje: Date = inicioDoDiaUTC(),
): EstadoPrazo {
  if (prazoCandidatura === null) return "SEM_PRAZO_CONFIRMADO";
  if (prazoCandidatura < hoje) return "EXPIRADO";
  if (dataAbertura !== null && dataAbertura > hoje) return "FUTURO";
  return "ABERTO";
}
