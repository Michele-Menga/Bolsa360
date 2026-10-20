import { prisma } from "../../config/database";
import { AppError } from "../../shared/errors/AppError";
import { calcularEstadoPrazo } from "../../shared/utils/prazo";
import {
  FiltrosOportunidades,
  listarOportunidadesPublicas,
} from "./oportunidades.repository";
import { obterOportunidadePublica } from "./oportunidades.detalhe.repository";
import { ListarOportunidadesQuery } from "./oportunidades.schema";

function paraFiltros(query: ListarOportunidadesQuery): FiltrosOportunidades {
  return {
    q: query.q,
    tipo: query.tipo,
    nivel: query.nivel,
    categoria: query.categoria,
    paisDestino: query.paisDestino,
    financiamento: query.financiamento,
    elegibilidadeAngolanos: query.elegibilidadeAngolanos,
    estadoPrazo: query.estadoPrazo,
    ordenar: query.ordenar,
    pagina: query.pagina,
    limite: query.limite,
  };
}

export async function listarOportunidades(query: ListarOportunidadesQuery) {
  const resultado = await listarOportunidadesPublicas(
    prisma,
    paraFiltros(query),
  );

  return {
    data: resultado.data.map((oportunidade) => ({
      ...oportunidade,
      valorFinanciamento: oportunidade.valorFinanciamento?.toString() ?? null,
    })),
    meta: {
      ...resultado.meta,
      totalPaginas: Math.ceil(resultado.meta.total / resultado.meta.limite),
    },
  };
}

export async function obterOportunidade(id: string) {
  const oportunidade = await obterOportunidadePublica(prisma, id);

  if (!oportunidade) {
    throw new AppError(404, "Oportunidade não encontrada.", "NAO_ENCONTRADA");
  }

  const elegibilidadeAngolanos = oportunidade.paisesElegiveis.find(
    (pais) => pais.codigoPais === "AO" && pais.tipoCriterio === "NACIONALIDADE",
  );

  return {
    id: oportunidade.id,
    titulo: oportunidade.titulo,
    entidadeFinanciadora: oportunidade.entidadeFinanciadora,
    descricao: oportunidade.descricao,
    tipo: oportunidade.tipo,
    nivelEnsino: oportunidade.nivelEnsino,
    categorias: oportunidade.categorias.map((c) => c.categoria),
    paisDestinoCodigo: oportunidade.paisDestinoCodigo,
    modalidade: oportunidade.modalidade,
    tipoFinanciamento: oportunidade.tipoFinanciamento,
    valorFinanciamento: oportunidade.valorFinanciamento?.toString() ?? null,
    moeda: oportunidade.moeda,
    dataAbertura: oportunidade.dataAbertura,
    prazoCandidatura: oportunidade.prazoCandidatura,
    cicloAno: oportunidade.cicloAno,
    estadoPrazo: calcularEstadoPrazo(
      oportunidade.dataAbertura,
      oportunidade.prazoCandidatura,
    ),
    elegibilidadeAngolanos: elegibilidadeAngolanos?.resultado ?? "POR_CONFIRMAR",
    urlFonteOficial: oportunidade.urlFonteOficial,
    urlCandidatura: oportunidade.urlCandidatura,
    ultimaVerificacaoEm: oportunidade.ultimaVerificacaoEm,
    regras: oportunidade.regras.map((regra) => ({
      tipoRegra: regra.tipoRegra,
      operador: regra.operador,
      valorTexto: regra.valorTexto,
      valorNumerico: regra.valorNumerico?.toString() ?? null,
      valorMinimo: regra.valorMinimo?.toString() ?? null,
      valorMaximo: regra.valorMaximo?.toString() ?? null,
      obrigatoriedade: regra.obrigatoriedade,
      estadoConfirmacao: regra.estadoConfirmacao,
      textoFonte: regra.textoFonte,
      urlFonte: regra.urlFonte,
    })),
    documentosExigidos: oportunidade.documentosExigidos.map((documento) => ({
      nome: documento.nome,
      descricao: documento.descricao,
      obrigatorio: documento.obrigatorio,
      estadoConfirmacao: documento.estadoConfirmacao,
    })),
    elegibilidadePaises: oportunidade.paisesElegiveis.map((pais) => ({
      codigoPais: pais.codigoPais,
      tipoCriterio: pais.tipoCriterio,
      resultado: pais.resultado,
      observacoes: pais.observacoes,
    })),
  };
}
