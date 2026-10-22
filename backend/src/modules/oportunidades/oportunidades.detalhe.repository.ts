import { EstadoEditorial, PrismaClient } from "@prisma/client";

export async function obterOportunidadePublica(
  prisma: PrismaClient,
  id: string,
) {
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
