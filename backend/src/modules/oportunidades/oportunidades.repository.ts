import { Prisma, PrismaClient } from '@prisma/client';
import type { TipoFinanciamento, ResultadoElegibilidade } from '@prisma/client';
import { calcularEstadoPrazo, inicioDoDiaUTC, type EstadoPrazo } from '../../shared/utils/prazo';

export type { EstadoPrazo };

export type FiltrosOportunidades = {
  q?: string;
  tipo?: string; // codigo do tipo, ex.: BOLSA_UNIVERSITARIA
  nivel?: string; // codigo do nivel, ex.: MESTRADO
  categoria?: string; // slug, ex.: engenharia
  paisDestino?: string; // 2 letras, ex.: PT
  financiamento?: TipoFinanciamento;
  elegibilidadeAngolanos?: ResultadoElegibilidade;
  estadoPrazo?: EstadoPrazo;
  ordenar?: 'prazo' | 'recentes';
  pagina?: number;
  limite?: number;
};

const LIMITE_MAXIMO = 50;
const LIMITE_PADRAO = 10;

// O estado do prazo deriva das datas e vive em shared/utils/prazo.ts.
// Os filtros abaixo TÊM de refletir a mesma ordem de regras dessa função.
export function construirWhere(
  f: FiltrosOportunidades,
  hoje: Date = inicioDoDiaUTC(),
): Prisma.OportunidadeWhereInput {
  const and: Prisma.OportunidadeWhereInput[] = [{ estadoEditorial: 'PUBLICADA' }]; // RN-01

  const q = f.q?.trim();
  if (q) {
    and.push({
      OR: [
        { titulo: { contains: q, mode: 'insensitive' } },
        { entidadeFinanciadora: { contains: q, mode: 'insensitive' } },
      ],
    });
  }
  if (f.tipo) and.push({ tipo: { codigo: f.tipo } });
  if (f.nivel) and.push({ nivelEnsino: { codigo: f.nivel } });
  if (f.categoria) and.push({ categorias: { some: { categoria: { slug: f.categoria } } } });
  if (f.paisDestino) and.push({ paisDestinoCodigo: f.paisDestino.toUpperCase() });
  if (f.financiamento) and.push({ tipoFinanciamento: f.financiamento });

  if (f.elegibilidadeAngolanos) {
    const ao = { codigoPais: 'AO', tipoCriterio: 'NACIONALIDADE' as const };
    if (f.elegibilidadeAngolanos === 'POR_CONFIRMAR') {
      // sem registo para AO tambem conta como "por confirmar" (RN-17)
      and.push({
        OR: [
          { paisesElegiveis: { some: { ...ao, resultado: 'POR_CONFIRMAR' } } },
          { paisesElegiveis: { none: ao } },
        ],
      });
    } else {
      and.push({ paisesElegiveis: { some: { ...ao, resultado: f.elegibilidadeAngolanos } } });
    }
  }

  switch (f.estadoPrazo) {
    case 'SEM_PRAZO_CONFIRMADO':
      and.push({ prazoCandidatura: null });
      break;
    case 'EXPIRADO':
      and.push({ prazoCandidatura: { lt: hoje } });
      break;
    case 'FUTURO':
      and.push({ prazoCandidatura: { gte: hoje } }, { dataAbertura: { gt: hoje } });
      break;
    case 'ABERTO':
      and.push(
        { prazoCandidatura: { gte: hoje } },
        { OR: [{ dataAbertura: null }, { dataAbertura: { lte: hoje } }] },
      );
      break;
  }

  return { AND: and };
}

// Campos escolhidos explicitamente (nunca devolver o registo inteiro).
const selecionar = {
  id: true,
  titulo: true,
  entidadeFinanciadora: true,
  tipo: { select: { codigo: true, nome: true } },
  nivelEnsino: { select: { codigo: true, nome: true } },
  paisDestinoCodigo: true,
  modalidade: true,
  tipoFinanciamento: true,
  valorFinanciamento: true,
  moeda: true,
  dataAbertura: true,
  prazoCandidatura: true,
  urlFonteOficial: true,
  ultimaVerificacaoEm: true,
  paisesElegiveis: {
    where: { codigoPais: 'AO', tipoCriterio: 'NACIONALIDADE' as const },
    select: { resultado: true },
  },
} satisfies Prisma.OportunidadeSelect;

export async function listarOportunidadesPublicas(
  prisma: PrismaClient,
  filtros: FiltrosOportunidades = {},
) {
  const hoje = inicioDoDiaUTC();
  const pagina = Math.max(1, Math.trunc(filtros.pagina ?? 1));
  const limite = Math.min(LIMITE_MAXIMO, Math.max(1, Math.trunc(filtros.limite ?? LIMITE_PADRAO)));
  const where = construirWhere(filtros, hoje);

  const orderBy: Prisma.OportunidadeOrderByWithRelationInput[] =
    filtros.ordenar === 'recentes'
      ? [{ criadoEm: 'desc' }, { id: 'asc' }]
      : [{ prazoCandidatura: { sort: 'asc', nulls: 'last' } }, { id: 'asc' }];

  const [linhas, total] = await prisma.$transaction([
    prisma.oportunidade.findMany({
      where,
      select: selecionar,
      orderBy,
      skip: (pagina - 1) * limite,
      take: limite,
    }),
    prisma.oportunidade.count({ where }),
  ]);

  const data = linhas.map(({ paisesElegiveis, ...o }) => ({
    ...o,
    estadoPrazo: calcularEstadoPrazo(o.dataAbertura, o.prazoCandidatura, hoje),
    elegibilidadeAngolanos: paisesElegiveis[0]?.resultado ?? 'POR_CONFIRMAR',
  }));

  return { data, meta: { pagina, limite, total } };
}