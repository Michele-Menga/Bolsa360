import type { PrismaClient } from '@prisma/client';

export type MetricasAdmin = {
  utilizadores: number;
  oportunidades: number; // bolsas
  pendencias: number; // oportunidades à espera de publicação
  candidaturas: number;
};

// RF-34: totais para o painel administrativo. Os quatro counts vão numa só
// transação para saírem de um retrato coerente da base.
export async function metricasAdmin(prisma: PrismaClient): Promise<MetricasAdmin> {
  const [utilizadores, oportunidades, pendencias, candidaturas] = await prisma.$transaction([
    prisma.utilizador.count(),
    prisma.oportunidade.count(),
    prisma.oportunidade.count({ where: { estadoEditorial: 'PENDENTE' } }),
    prisma.candidatura.count(),
  ]);

  return { utilizadores, oportunidades, pendencias, candidaturas };
}
