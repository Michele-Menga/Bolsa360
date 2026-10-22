import { z } from "zod";

export const criarCandidaturaSchema = z
  .object({
    oportunidadeId: z.uuid(),
  })
  .strict();

export const atualizarCandidaturaSchema = z
  .object({
    estado: z.enum([
      "PLANEADA",
      "EM_PREPARACAO",
      "SUBMETIDA_EXTERNAMENTE",
      "EM_AVALIACAO",
      "ACEITE",
      "REJEITADA",
      "CANCELADA",
    ]),
    notasPrivadas: z.string().max(2000).optional(),
    observacao: z.string().max(500).optional(),
  })
  .strict();

export type CriarCandidaturaInput = z.infer<typeof criarCandidaturaSchema>;
export type AtualizarCandidaturaInput = z.infer<typeof atualizarCandidaturaSchema>;
