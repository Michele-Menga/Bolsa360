import { z } from "zod";

const inteiroPositivo = z.coerce.number().int().positive();

export const listarOportunidadesQuerySchema = z
  .object({
    pagina: inteiroPositivo.default(1),
    limite: inteiroPositivo.max(50).default(10),
    q: z.string().trim().min(1).max(200).optional(),
    tipo: z.string().trim().min(1).max(60).optional(),
    nivel: z.string().trim().min(1).max(60).optional(),
    categoria: z.string().trim().min(1).max(120).optional(),
    paisDestino: z.string().trim().toUpperCase().length(2).optional(),
    financiamento: z
      .enum([
        "INTEGRAL",
        "PARCIAL",
        "PROPINA",
        "ESTIPENDIO",
        "CURSO_GRATUITO",
        "OUTRO",
      ])
      .optional(),
    elegibilidadeAngolanos: z
      .enum(["ELEGIVEL", "NAO_ELEGIVEL", "POR_CONFIRMAR"])
      .optional(),
    estadoPrazo: z
      .enum(["FUTURO", "ABERTO", "EXPIRADO", "SEM_PRAZO_CONFIRMADO"])
      .optional(),
    ordenar: z.enum(["prazo", "recentes"]).optional(),
  })
  .strict();

export type ListarOportunidadesQuery = z.infer<
  typeof listarOportunidadesQuerySchema
>;
