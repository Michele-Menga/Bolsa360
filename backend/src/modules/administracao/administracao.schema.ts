import { z } from "zod";

const modalidades = [
  "PRESENCIAL",
  "ONLINE",
  "HIBRIDA",
  "NAO_APLICAVEL",
] as const;

const tiposFinanciamento = [
  "INTEGRAL",
  "PARCIAL",
  "PROPINA",
  "ESTIPENDIO",
  "CURSO_GRATUITO",
  "OUTRO",
] as const;

const estadosEditoriais = [
  "RASCUNHO",
  "PENDENTE",
  "VERIFICADA",
  "PUBLICADA",
  "REJEITADA",
  "ARQUIVADA",
] as const;

const valorMonetario = z.union([
  z.number().nonnegative(),
  z
    .string()
    .trim()
    .regex(/^\d+(\.\d{1,2})?$/, "Valor monetário inválido."),
]);

const camposOportunidade = z
  .object({
    titulo: z.string().trim().min(3).max(200),
    entidadeFinanciadora: z.string().trim().min(2).max(200),
    tipoOportunidadeId: z.uuid(),
    descricao: z.string().trim().min(10),
    nivelEnsinoId: z.uuid().optional(),
    paisDestinoCodigo: z.string().trim().toUpperCase().length(2).optional(),
    modalidade: z.enum(modalidades).optional(),
    tipoFinanciamento: z.enum(tiposFinanciamento),
    valorFinanciamento: valorMonetario.optional(),
    moeda: z.string().trim().toUpperCase().length(3).optional(),
    dataAbertura: z.coerce.date().optional(),
    prazoCandidatura: z.coerce.date().optional(),
    cicloAno: z.string().trim().max(20).optional(),
    urlFonteOficial: z.url(),
    urlCandidatura: z.url().optional(),
  })
  .strict();

export const criarOportunidadeSchema = camposOportunidade;

export const atualizarOportunidadeSchema = camposOportunidade
  .partial()
  .refine((dados) => Object.keys(dados).length > 0, {
    message: "Nenhum campo para atualizar.",
  });

export const listarAdminQuerySchema = z
  .object({
    pagina: z.coerce.number().int().positive().default(1),
    limite: z.coerce.number().int().positive().max(50).default(10),
    estadoEditorial: z.enum(estadosEditoriais).optional(),
    pesquisa: z.string().trim().min(1).max(200).optional(),
  })
  .strict();

export type CriarOportunidadeInput = z.infer<typeof criarOportunidadeSchema>;
export type AtualizarOportunidadeInput = z.infer<typeof atualizarOportunidadeSchema>;
export type ListarAdminQuery = z.infer<typeof listarAdminQuerySchema>;
