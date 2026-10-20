import { Prisma } from "@prisma/client";
import { prisma } from "../../config/database";
import { AppError } from "../../shared/errors/AppError";
import { calcularEstadoPrazo } from "../../shared/utils/prazo";

const includeOportunidade = {
  oportunidade: {
    include: { tipo: { select: { codigo: true, nome: true } } },
  },
} satisfies Prisma.FavoritoInclude;

type FavoritoComOportunidade = Prisma.FavoritoGetPayload<{
  include: typeof includeOportunidade;
}>;

function serializar(favorito: FavoritoComOportunidade) {
  const oportunidade = favorito.oportunidade;

  return {
    id: oportunidade.id,
    titulo: oportunidade.titulo,
    entidadeFinanciadora: oportunidade.entidadeFinanciadora,
    tipo: oportunidade.tipo,
    estadoEditorial: oportunidade.estadoEditorial,
    valorFinanciamento: oportunidade.valorFinanciamento?.toString() ?? null,
    moeda: oportunidade.moeda,
    prazoCandidatura: oportunidade.prazoCandidatura,
    estadoPrazo: calcularEstadoPrazo(
      oportunidade.dataAbertura,
      oportunidade.prazoCandidatura,
    ),
    urlFonteOficial: oportunidade.urlFonteOficial,
    favoritadoEm: favorito.criadoEm,
  };
}

export async function listarFavoritos(utilizadorId: string) {
  const favoritos = await prisma.favorito.findMany({
    where: { utilizadorId },
    orderBy: { criadoEm: "desc" },
    include: includeOportunidade,
  });

  return favoritos.map(serializar);
}

export async function adicionarFavorito(
  utilizadorId: string,
  oportunidadeId: string,
) {
  const oportunidade = await prisma.oportunidade.findFirst({
    where: { id: oportunidadeId, estadoEditorial: "PUBLICADA" },
    select: { id: true },
  });

  if (!oportunidade) {
    throw new AppError(404, "Oportunidade não encontrada.", "NAO_ENCONTRADA");
  }

  try {
    await prisma.favorito.create({ data: { utilizadorId, oportunidadeId } });
  } catch (erro) {
    if (erro instanceof Prisma.PrismaClientKnownRequestError && erro.code === "P2002") {
      return { ok: true };
    }
    throw erro;
  }

  return { ok: true };
}

export async function removerFavorito(
  utilizadorId: string,
  oportunidadeId: string,
) {
  await prisma.favorito.deleteMany({ where: { utilizadorId, oportunidadeId } });
  return { ok: true };
}
