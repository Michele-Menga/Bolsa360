import { Prisma } from "@prisma/client";
import { prisma } from "../../config/database";
import { AppError } from "../../shared/errors/AppError";
import { registarAuditoria } from "../auditoria/auditoria.repository";
import { metricasAdmin } from "./administracao.repository";
import {
  AtualizarOportunidadeInput,
  CriarOportunidadeInput,
  ListarAdminQuery,
} from "./administracao.schema";

type OportunidadeResumo = {
  id: string;
  titulo: string;
  entidadeFinanciadora: string;
  tipo: { codigo: string; nome: string };
  estadoEditorial: string;
  tipoFinanciamento: string;
  valorFinanciamento: Prisma.Decimal | null;
  moeda: string | null;
  dataAbertura: Date | null;
  prazoCandidatura: Date | null;
  cicloAno: string | null;
  urlFonteOficial: string;
  urlCandidatura: string | null;
  ultimaVerificacaoEm: Date | null;
  criadoEm: Date;
  atualizadoEm: Date;
};

function valorComoTexto(valor: number | string | undefined): string | undefined {
  if (valor === undefined) return undefined;
  return typeof valor === "number" ? valor.toFixed(2) : valor;
}

function serializar(oportunidade: OportunidadeResumo) {
  return {
    id: oportunidade.id,
    titulo: oportunidade.titulo,
    entidadeFinanciadora: oportunidade.entidadeFinanciadora,
    tipo: oportunidade.tipo,
    estadoEditorial: oportunidade.estadoEditorial,
    tipoFinanciamento: oportunidade.tipoFinanciamento,
    valorFinanciamento: oportunidade.valorFinanciamento?.toString() ?? null,
    moeda: oportunidade.moeda,
    dataAbertura: oportunidade.dataAbertura,
    prazoCandidatura: oportunidade.prazoCandidatura,
    cicloAno: oportunidade.cicloAno,
    urlFonteOficial: oportunidade.urlFonteOficial,
    urlCandidatura: oportunidade.urlCandidatura,
    ultimaVerificacaoEm: oportunidade.ultimaVerificacaoEm,
    criadoEm: oportunidade.criadoEm,
    atualizadoEm: oportunidade.atualizadoEm,
  };
}

export async function listarOportunidadesAdmin(query: ListarAdminQuery) {
  const where: Prisma.OportunidadeWhereInput = {
    ...(query.estadoEditorial ? { estadoEditorial: query.estadoEditorial } : {}),
    ...(query.pesquisa
      ? {
          OR: [
            { titulo: { contains: query.pesquisa, mode: "insensitive" } },
            {
              entidadeFinanciadora: {
                contains: query.pesquisa,
                mode: "insensitive",
              },
            },
          ],
        }
      : {}),
  };

  const [itens, total] = await prisma.$transaction([
    prisma.oportunidade.findMany({
      where,
      skip: (query.pagina - 1) * query.limite,
      take: query.limite,
      orderBy: { atualizadoEm: "desc" },
      include: { tipo: { select: { codigo: true, nome: true } } },
    }),
    prisma.oportunidade.count({ where }),
  ]);

  return {
    data: itens.map(serializar),
    meta: {
      pagina: query.pagina,
      limite: query.limite,
      total,
      totalPaginas: Math.ceil(total / query.limite),
    },
  };
}

export async function criarOportunidade(
  administradorId: string,
  dados: CriarOportunidadeInput,
  enderecoIp?: string | null,
) {
  const criada = await prisma.$transaction(async (tx) => {
    const oportunidade = await tx.oportunidade.create({
      data: {
        ...dados,
        valorFinanciamento: valorComoTexto(dados.valorFinanciamento),
        estadoEditorial: "RASCUNHO",
        criadoPorId: administradorId,
      },
      include: { tipo: { select: { codigo: true, nome: true } } },
    });

    await registarAuditoria(tx, {
      atorUtilizadorId: administradorId,
      acao: "CRIAR_OPORTUNIDADE",
      tipoEntidade: "Oportunidade",
      entidadeId: oportunidade.id,
      detalhesMinimos: {
        titulo: oportunidade.titulo,
        estadoEditorial: oportunidade.estadoEditorial,
      },
      enderecoIp: enderecoIp ?? null,
    });

    return oportunidade;
  });

  return serializar(criada);
}

async function garantirQueExiste(id: string): Promise<void> {
  const existe = await prisma.oportunidade.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!existe) {
    throw new AppError(404, "Oportunidade não encontrada.", "NAO_ENCONTRADA");
  }
}

export async function obterOportunidadeAdmin(id: string) {
  const oportunidade = await prisma.oportunidade.findUnique({
    where: { id },
    include: {
      tipo: { select: { codigo: true, nome: true, descricao: true } },
      nivelEnsino: { select: { codigo: true, nome: true } },
      categorias: { include: { categoria: true } },
      regras: { orderBy: { ordemExibicao: "asc" } },
      documentosExigidos: { orderBy: { nome: "asc" } },
      paisesElegiveis: true,
      verificacoes: { orderBy: { verificadaEm: "desc" } },
    },
  });

  if (!oportunidade) {
    throw new AppError(404, "Oportunidade não encontrada.", "NAO_ENCONTRADA");
  }

  // Registo completo: tudo o que o formulário de edição precisa para se
  // pré-preencher (incluindo os IDs de tipo e nível, que a listagem não traz).
  return {
    ...serializar(oportunidade),
    descricao: oportunidade.descricao,
    tipoOportunidadeId: oportunidade.tipoOportunidadeId,
    nivelEnsinoId: oportunidade.nivelEnsinoId,
    nivelEnsino: oportunidade.nivelEnsino,
    paisDestinoCodigo: oportunidade.paisDestinoCodigo,
    modalidade: oportunidade.modalidade,
    categorias: oportunidade.categorias.map((c) => c.categoria),
    regras: oportunidade.regras.map((regra) => ({
      ...regra,
      valorNumerico: regra.valorNumerico?.toString() ?? null,
      valorMinimo: regra.valorMinimo?.toString() ?? null,
      valorMaximo: regra.valorMaximo?.toString() ?? null,
    })),
    documentosExigidos: oportunidade.documentosExigidos,
    elegibilidadePaises: oportunidade.paisesElegiveis,
    verificacoes: oportunidade.verificacoes,
  };
}

export async function atualizarOportunidade(
  id: string,
  dados: AtualizarOportunidadeInput,
  administradorId: string,
  enderecoIp?: string | null,
) {
  await garantirQueExiste(id);

  const atualizada = await prisma.$transaction(async (tx) => {
    const oportunidade = await tx.oportunidade.update({
      where: { id },
      data: {
        ...dados,
        valorFinanciamento: valorComoTexto(dados.valorFinanciamento),
      },
      include: { tipo: { select: { codigo: true, nome: true } } },
    });

    await registarAuditoria(tx, {
      atorUtilizadorId: administradorId,
      acao: "ATUALIZAR_OPORTUNIDADE",
      tipoEntidade: "Oportunidade",
      entidadeId: id,
      detalhesMinimos: { campos: Object.keys(dados) },
      enderecoIp: enderecoIp ?? null,
    });

    return oportunidade;
  });

  return serializar(atualizada);
}

export async function publicarOportunidade(
  id: string,
  administradorId: string,
  enderecoIp?: string | null,
) {
  return prisma.$transaction(async (tx) => {
    const oportunidade = await tx.oportunidade.findUnique({ where: { id } });
    if (!oportunidade) {
      throw new AppError(404, "Oportunidade não encontrada.", "NAO_ENCONTRADA");
    }

    const agora = new Date();

    const atualizada = await tx.oportunidade.update({
      where: { id },
      data: { estadoEditorial: "PUBLICADA", ultimaVerificacaoEm: agora },
      include: { tipo: { select: { codigo: true, nome: true } } },
    });

    await tx.verificacaoOportunidade.create({
      data: {
        oportunidadeId: id,
        administradorId,
        estado: "VERIFICADA",
        verificadaEm: agora,
        urlConsultada: oportunidade.urlFonteOficial,
        notas: "Publicação efetuada pelo administrador.",
      },
    });

    await registarAuditoria(tx, {
      atorUtilizadorId: administradorId,
      acao: "PUBLICAR_OPORTUNIDADE",
      tipoEntidade: "Oportunidade",
      entidadeId: id,
      detalhesMinimos: {
        estadoAnterior: oportunidade.estadoEditorial,
        estadoNovo: "PUBLICADA",
      },
      enderecoIp: enderecoIp ?? null,
    });

    return serializar(atualizada);
  });
}

export async function arquivarOportunidade(
  id: string,
  administradorId: string,
  enderecoIp?: string | null,
) {
  await garantirQueExiste(id);

  const atualizada = await prisma.$transaction(async (tx) => {
    const oportunidade = await tx.oportunidade.update({
      where: { id },
      data: { estadoEditorial: "ARQUIVADA" },
      include: { tipo: { select: { codigo: true, nome: true } } },
    });

    await registarAuditoria(tx, {
      atorUtilizadorId: administradorId,
      acao: "ARQUIVAR_OPORTUNIDADE",
      tipoEntidade: "Oportunidade",
      entidadeId: id,
      detalhesMinimos: { estadoNovo: "ARQUIVADA" },
      enderecoIp: enderecoIp ?? null,
    });

    return oportunidade;
  });

  return serializar(atualizada);
}

export async function obterMetricasAdmin() {
  return metricasAdmin(prisma);
}
