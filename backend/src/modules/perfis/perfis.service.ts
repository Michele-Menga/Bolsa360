import { PerfilCandidato } from "@prisma/client";
import { prisma } from "../../config/database";
import { AppError } from "../../shared/errors/AppError";
import { AtualizarPerfilInput } from "./perfis.schema";

function serializar(perfil: PerfilCandidato) {
  return {
    utilizadorId: perfil.utilizadorId,
    nacionalidadeCodigo: perfil.nacionalidadeCodigo,
    dataNascimento: perfil.dataNascimento,
    nivelEnsinoAtualId: perfil.nivelEnsinoAtualId,
    areaEstudo: perfil.areaEstudo,
    instituicaoEnsino: perfil.instituicaoEnsino,
    paisDestinoPreferido: perfil.paisDestinoPreferido,
    idiomas: perfil.idiomas,
    criadoEm: perfil.criadoEm,
    atualizadoEm: perfil.atualizadoEm,
  };
}

export async function obterPerfil(utilizadorId: string) {
  const perfil = await prisma.perfilCandidato.findUnique({
    where: { utilizadorId },
  });

  if (!perfil) {
    throw new AppError(404, "Perfil não encontrado.", "PERFIL_NAO_ENCONTRADO");
  }

  return serializar(perfil);
}

export async function guardarPerfil(
  utilizadorId: string,
  dados: AtualizarPerfilInput,
) {
  const perfil = await prisma.perfilCandidato.upsert({
    where: { utilizadorId },
    update: dados,
    create: { utilizadorId, ...dados },
  });

  return serializar(perfil);
}
