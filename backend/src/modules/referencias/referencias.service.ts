import { prisma } from "../../config/database";

/**
 * Listas de referência (só leitura) usadas pelos filtros do catálogo e pelos
 * formulários (perfil e administração). Devolvem os IDs reais da base de dados,
 * para o frontend não depender dos IDs fixos do seed.
 */
export async function obterReferencias() {
  const [tipos, niveis, categorias] = await prisma.$transaction([
    prisma.tipoOportunidade.findMany({
      where: { ativo: true },
      orderBy: { nome: "asc" },
      select: { id: true, codigo: true, nome: true, descricao: true },
    }),
    prisma.nivelEnsino.findMany({
      where: { ativo: true },
      orderBy: [{ ordem: "asc" }, { nome: "asc" }],
      select: { id: true, codigo: true, nome: true, ordem: true },
    }),
    prisma.categoriaEstudo.findMany({
      orderBy: { nome: "asc" },
      select: { id: true, nome: true, slug: true },
    }),
  ]);

  return { tipos, niveis, categorias };
}
