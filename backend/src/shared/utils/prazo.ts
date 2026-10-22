export function calcularEstadoPrazo(
  dataAbertura: Date | null,
  prazoCandidatura: Date | null,
): string {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  if (prazoCandidatura === null) return "SEM_PRAZO_CONFIRMADO";
  if (dataAbertura !== null && dataAbertura > hoje) return "FUTURO";
  if (prazoCandidatura < hoje) return "EXPIRADO";
  return "ABERTO";
}
