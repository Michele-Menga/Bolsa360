import { z } from "zod";

const inteiroPositivo = z.coerce.number().int().positive();

export const listarOportunidadesQuerySchema = z.object({
  pagina: inteiroPositivo.default(1),
  limite: inteiroPositivo.max(50).default(10),
  pesquisa: z.string().trim().min(1).max(200).optional(),
  tipoOportunidadeId: z.uuid().optional(),
  nivelEnsinoId: z.uuid().optional(),
  categoriaSlug: z.string().trim().min(1).max(120).optional(),
  paisDestinoCodigo: z.string().trim().toUpperCase().length(2).optional(),
  modalidade: z.enum(["PRESENCIAL", "ONLINE", "HIBRIDA", "NAO_APLICAVEL"]).optional(),
  tipoFinanciamento: z.enum([
    "INTEGRAL",
    "PARCIAL",
    "PROPINA",
    "ESTIPENDIO",
    "CURSO_GRATUITO",
    "OUTRO",
  ]).optional(),
  elegibilidadeAngolanos: z.enum(["ELEGIVEL", "NAO_ELEGIVEL", "POR_CONFIRMAR"]).optional(),
  estadoPrazo: z.enum(["FUTURO", "ABERTO", "EXPIRADO", "SEM_PRAZO_CONFIRMADO"]).optional(),
}).strict();

export type ListarOportunidadesQuery = z.infer<typeof listarOportunidadesQuerySchema>;
