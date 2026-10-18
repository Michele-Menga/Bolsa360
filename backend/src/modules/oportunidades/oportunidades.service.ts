import { prisma } from "../../config/database";
import { FiltrosOportunidades, listarOportunidadesPublicas } from "./oportunidades.repository";
import { ListarOportunidadesQuery } from "./oportunidades.schema";

function calcularEstadoPrazo(dataAbertura: Date | null, prazoCandidatura: Date | null): string {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  if (prazoCandidatura === null) return "SEM_PRAZO_CONFIRMADO";
  if (dataAbertura !== null && dataAbertura > hoje) return "FUTURO";
  if (prazoCandidatura < hoje) return "EXPIRADO";
  return "ABERTO";
}

function paraFiltros(query: ListarOportunidadesQuery): FiltrosOportunidades {
  return query;
}

export async function listarOportunidades(query: ListarOportunidadesQuery) {
  const filtros = paraFiltros(query);
  const { oportunidades, total } = await listarOportunidadesPublicas(prisma, filtros);

  return {
    data: oportunidades.map((oportunidade) => ({
      id: oportunidade.id,
      titulo: oportunidade.titulo,
      entidadeFinanciadora: oportunidade.entidadeFinanciadora,
      tipo: oportunidade.tipo,
      paisDestinoCodigo: oportunidade.paisDestinoCodigo,
      modalidade: oportunidade.modalidade,
      tipoFinanciamento: oportunidade.tipoFinanciamento,
      valorFinanciamento: oportunidade.valorFinanciamento?.toString() ?? null,
      moeda: oportunidade.moeda,
      dataAbertura: oportunidade.dataAbertura,
      prazoCandidatura: oportunidade.prazoCandidatura,
      estadoPrazo: calcularEstadoPrazo(oportunidade.dataAbertura, oportunidade.prazoCandidatura),
      elegibilidadeAngolanos: oportunidade.paisesElegiveis[0]?.resultado ?? "POR_CONFIRMAR",
      urlFonteOficial: oportunidade.urlFonteOficial,
    })),
    meta: {
      pagina: filtros.pagina,
      limite: filtros.limite,
      total,
      totalPaginas: Math.ceil(total / filtros.limite),
    },
  };
}
