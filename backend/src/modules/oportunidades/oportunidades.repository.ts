import { EstadoEditorial, Prisma, PrismaClient, ResultadoElegibilidade } from "@prisma/client";

export type EstadoPrazo = "FUTURO" | "ABERTO" | "EXPIRADO" | "SEM_PRAZO_CONFIRMADO";

export type FiltrosOportunidades = {
  pagina: number;
  limite: number;
  pesquisa?: string;
  tipoOportunidadeId?: string;
  nivelEnsinoId?: string;
  categoriaSlug?: string;
  paisDestinoCodigo?: string;
  modalidade?: "PRESENCIAL" | "ONLINE" | "HIBRIDA" | "NAO_APLICAVEL";
  tipoFinanciamento?: "INTEGRAL" | "PARCIAL" | "PROPINA" | "ESTIPENDIO" | "CURSO_GRATUITO" | "OUTRO";
  elegibilidadeAngolanos?: ResultadoElegibilidade;
  estadoPrazo?: EstadoPrazo;
};

function filtroPrazo(estadoPrazo: EstadoPrazo | undefined, hoje: Date): Prisma.OportunidadeWhereInput | undefined {
  switch (estadoPrazo) {
    case "FUTURO":
      return { dataAbertura: { gt: hoje } };
    case "ABERTO":
      return {
        AND: [
          { OR: [{ dataAbertura: null }, { dataAbertura: { lte: hoje } }] },
          { prazoCandidatura: { gte: hoje } },
        ],
      };
    case "EXPIRADO":
      return { prazoCandidatura: { lt: hoje } };
    case "SEM_PRAZO_CONFIRMADO":
      return { prazoCandidatura: null };
    default:
      return undefined;
  }
}

export async function listarOportunidadesPublicas(
  prisma: PrismaClient,
  filtros: FiltrosOportunidades,
) {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const where: Prisma.OportunidadeWhereInput = {
    estadoEditorial: EstadoEditorial.PUBLICADA,
    ...(filtros.pesquisa
      ? {
          OR: [
            { titulo: { contains: filtros.pesquisa, mode: "insensitive" } },
            { entidadeFinanciadora: { contains: filtros.pesquisa, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(filtros.tipoOportunidadeId ? { tipoOportunidadeId: filtros.tipoOportunidadeId } : {}),
    ...(filtros.nivelEnsinoId ? { nivelEnsinoId: filtros.nivelEnsinoId } : {}),
    ...(filtros.categoriaSlug
      ? { categorias: { some: { categoria: { slug: filtros.categoriaSlug } } } }
      : {}),
    ...(filtros.paisDestinoCodigo ? { paisDestinoCodigo: filtros.paisDestinoCodigo } : {}),
    ...(filtros.modalidade ? { modalidade: filtros.modalidade } : {}),
    ...(filtros.tipoFinanciamento ? { tipoFinanciamento: filtros.tipoFinanciamento } : {}),
    ...(filtros.elegibilidadeAngolanos
      ? {
          paisesElegiveis: {
            some: {
              codigoPais: "AO",
              tipoCriterio: "NACIONALIDADE",
              resultado: filtros.elegibilidadeAngolanos,
            },
          },
        }
      : {}),
    ...filtroPrazo(filtros.estadoPrazo, hoje),
  };

  const [oportunidades, total] = await prisma.$transaction([
    prisma.oportunidade.findMany({
      where,
      skip: (filtros.pagina - 1) * filtros.limite,
      take: filtros.limite,
      orderBy: [{ prazoCandidatura: "asc" }, { criadoEm: "desc" }],
      include: {
        tipo: { select: { codigo: true, nome: true } },
        paisesElegiveis: {
          where: { codigoPais: "AO", tipoCriterio: "NACIONALIDADE" },
          select: { resultado: true },
        },
      },
    }),
    prisma.oportunidade.count({ where }),
  ]);

  return { oportunidades, total };
}

export async function obterOportunidadePublica(prisma: PrismaClient, id: string) {
  return prisma.oportunidade.findFirst({
    where: { id, estadoEditorial: EstadoEditorial.PUBLICADA },
    include: {
      tipo: { select: { codigo: true, nome: true, descricao: true } },
      nivelEnsino: { select: { codigo: true, nome: true } },
      categorias: {
        include: { categoria: { select: { nome: true, slug: true } } },
      },
      regras: { orderBy: { ordemExibicao: "asc" } },
      documentosExigidos: { orderBy: { nome: "asc" } },
      paisesElegiveis: true,
    },
  });
}
