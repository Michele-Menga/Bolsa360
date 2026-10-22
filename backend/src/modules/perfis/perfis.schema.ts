import { z } from "zod";

const codigoPais = z.string().trim().toUpperCase().length(2);

export const atualizarPerfilSchema = z
  .object({
    nacionalidadeCodigo: codigoPais,
    dataNascimento: z.coerce.date().optional(),
    nivelEnsinoAtualId: z.uuid().optional(),
    areaEstudo: z.string().trim().max(100).optional(),
    instituicaoEnsino: z.string().trim().max(200).optional(),
    paisDestinoPreferido: codigoPais.optional(),
    idiomas: z.record(z.string(), z.string()).optional(),
  })
  .strict();

export type AtualizarPerfilInput = z.infer<typeof atualizarPerfilSchema>;
