import type { Papel } from "@/lib/types";

/**
 * Página inicial de cada papel depois de entrar.
 * MENTOR ainda não tem ecrãs próprios (a mentoria não está implementada): fica no início.
 */
export function paginaInicial(papel: Papel): string {
  if (papel === "ADMIN") return "/admin";
  if (papel === "CANDIDATO") return "/painel";
  if (papel === "MENTOR") return "/mentor";
  return "/";
}

/** Só o candidato tem favoritos, candidaturas e perfil (as rotas /perfis/* são exclusivas do papel CANDIDATO). */
export const temAreaDeCandidato = (papel?: Papel | null) => papel === "CANDIDATO";
