import { Prisma } from "@prisma/client";
import { prisma } from "../../config/database";
import { AppError } from "../../shared/errors/AppError";
import { calcularEstadoPrazo } from "../../shared/utils/prazo";
import { AtualizarCandidaturaInput } from "./candidaturas.schema";

const includeOportunidade = {
  oportunidade: {
    select: {
      id: true,
      titulo: true,
      entidadeFinanciadora: true,
      estadoEditorial: true,
      valorFinanciamento: true,
      moeda: true,
      dataAbertura: true,
      prazoCandidatura: true,
    },
  },
} satisfies Prisma.CandidaturaInclude;

type CandidaturaComOportunidade = Prisma.CandidaturaGetPayload<{
  include: typeof includeOportunidade;
}>;

function serializar(candidatura: CandidaturaComOportunidade) {
  const oportunidade = candidatura.oportunidade;

  return {
    id: candidatura.id,
    estado: candidatura.estado,
    notasPrivadas: candidatura.notasPrivadas,
    dataSubmissaoExterna: candidatura.dataSubmissaoExterna,
    criadoEm: candidatura.criadoEm,
    atualizadoEm: candidatura.atualizadoEm,
    oportunidade: {
      id: oportunidade.id,
      titulo: oportunidade.titulo,
      entidadeFinanciadora: oportunidade.entidadeFinanciadora,
      estadoEditorial: oportunidade.estadoEditorial,
      valorFinanciamento: oportunidade.valorFinanciamento?.toString() ?? null,
      moeda: oportunidade.moeda,
      prazoCandidatura: oportunidade.prazoCandidatura,
      estadoPrazo: calcularEstadoPrazo(
        oportunidade.dataAbertura,
        oportunidade.prazoCandidatura,
      ),
    },
  };
}

export async function listarCandidaturas(utilizadorId: string) {
  const candidaturas = await prisma.candidatura.findMany({
    where: { utilizadorId },
    orderBy: { atualizadoEm: "desc" },
    include: includeOportunidade,
  });

  return candidaturas.map(serializar);
}

export async function obterCandidatura(utilizadorId: string, id: string) {
  const candidatura = await prisma.candidatura.findUnique({
    where: { id },
    include: {
      ...includeOportunidade,
      historico: { orderBy: { alteradoEm: "asc" } },
    },
  });

  if (!candidatura || candidatura.utilizadorId !== utilizadorId) {
    throw new AppError(404, "Candidatura não encontrada.", "NAO_ENCONTRADA");
  }

  return {
    ...serializar(candidatura),
    historico: candidatura.historico,
  };
}

export async function criarCandidatura(
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

  const existente = await prisma.candidatura.findFirst({
    where: {
      utilizadorId,
      oportunidadeId,
      estado: { notIn: ["CANCELADA", "REJEITADA"] },
    },
    select: { id: true },
  });

  if (existente) {
    throw new AppError(
      409,
      "Já existe uma candidatura ativa para esta oportunidade.",
      "CANDIDATURA_DUPLICADA",
    );
  }

  try {
    return await prisma.$transaction(async (tx) => {
      const candidatura = await tx.candidatura.create({
        data: { utilizadorId, oportunidadeId },
        include: includeOportunidade,
      });

      await tx.historicoCandidatura.create({
        data: {
          candidaturaId: candidatura.id,
          estadoAnterior: null,
          estadoNovo: "PLANEADA",
          alteradoPorId: utilizadorId,
          observacao: "Candidatura criada.",
        },
      });

      return serializar(candidatura);
    });
  } catch (erro) {
    if (erro instanceof Prisma.PrismaClientKnownRequestError && erro.code === "P2002") {
      throw new AppError(
        409,
        "Já existe uma candidatura ativa para esta oportunidade.",
        "CANDIDATURA_DUPLICADA",
      );
    }
    throw erro;
  }
}

export async function atualizarCandidatura(
  utilizadorId: string,
  id: string,
  dados: AtualizarCandidaturaInput,
) {
  return prisma.$transaction(async (tx) => {
    const candidatura = await tx.candidatura.findUnique({ where: { id } });

    if (!candidatura || candidatura.utilizadorId !== utilizadorId) {
      throw new AppError(404, "Candidatura não encontrada.", "NAO_ENCONTRADA");
    }

    const mudouEstado = candidatura.estado !== dados.estado;
    const dataSubmissaoExterna =
      mudouEstado &&
      dados.estado === "SUBMETIDA_EXTERNAMENTE" &&
      !candidatura.dataSubmissaoExterna
        ? new Date()
        : undefined;

    const atualizada = await tx.candidatura.update({
      where: { id },
      data: {
        estado: dados.estado,
        ...(dados.notasPrivadas !== undefined
          ? { notasPrivadas: dados.notasPrivadas }
          : {}),
        ...(dataSubmissaoExterna ? { dataSubmissaoExterna } : {}),
      },
      include: includeOportunidade,
    });

    if (mudouEstado) {
      await tx.historicoCandidatura.create({
        data: {
          candidaturaId: id,
          estadoAnterior: candidatura.estado,
          estadoNovo: dados.estado,
          alteradoPorId: utilizadorId,
          observacao: dados.observacao ?? null,
        },
      });
    }

    return serializar(atualizada);
  });
}
