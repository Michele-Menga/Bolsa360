import { z } from "zod";

const especialidades = z.array(z.string().trim().min(2).max(60)).max(10);
const preco = z.string().trim().regex(/^\d{1,12}(\.\d{1,2})?$/, "Preço inválido");
const moeda = z.string().trim().length(3).transform((v) => v.toUpperCase());

export const atualizarMentorSchema = z
  .object({
    biografia: z.string().trim().max(2000).optional(),
    especialidades: especialidades.optional(),
  })
  .strict()
  .refine((o) => Object.keys(o).length > 0, "Indica pelo menos um campo.");

export const criarServicoSchema = z
  .object({
    titulo: z.string().trim().min(3).max(200),
    descricao: z.string().trim().min(10).max(2000),
    duracaoMinutos: z.number().int().min(15).max(240),
    preco,
    moeda,
  })
  .strict();

export const atualizarServicoSchema = z
  .object({
    titulo: z.string().trim().min(3).max(200),
    descricao: z.string().trim().min(10).max(2000),
    duracaoMinutos: z.number().int().min(15).max(240),
    preco,
    moeda,
    ativo: z.boolean(),
  })
  .partial()
  .strict()
  .refine((o) => Object.keys(o).length > 0, "Indica pelo menos um campo.");

export const agendaQuerySchema = z.object({
  estado: z.enum(["PENDENTE_PAGAMENTO", "CONFIRMADO", "CONCLUIDO", "CANCELADO"]).optional(),
});

export const cancelarAgendamentoSchema = z
  .object({ motivo: z.string().trim().min(3).max(500) })
  .strict();

export const recusarAgendamentoSchema = z
  .object({ motivo: z.string().trim().min(3).max(500).optional() })
  .strict();

// ---- administração de mentores ----
export const listarMentoresQuerySchema = z.object({
  estado: z.enum(["PENDENTE", "VERIFICADA", "REJEITADA"]).optional(),
  pagina: z.coerce.number().int().min(1).default(1),
  limite: z.coerce.number().int().min(1).max(50).default(10),
});

export const verificarMentorSchema = z
  .object({ estado: z.enum(["PENDENTE", "VERIFICADA", "REJEITADA"]) })
  .strict();

export const agendarSessaoSchema = z
  .object({
    servicoId: z.string().uuid(),
    inicio: z.string().datetime(),
    motivo: z.string().trim().max(500).optional(),
  })
  .strict();

export const mentoresPublicoQuerySchema = z.object({
  especialidade: z.string().trim().optional(),
  pesquisa: z.string().trim().optional(),
});

export type AtualizarMentorInput = z.infer<typeof atualizarMentorSchema>;
export type CriarServicoInput = z.infer<typeof criarServicoSchema>;
export type AtualizarServicoInput = z.infer<typeof atualizarServicoSchema>;
export type AgendaQuery = z.infer<typeof agendaQuerySchema>;
export type AgendarSessaoInput = z.infer<typeof agendarSessaoSchema>;
export type MentoresPublicoQuery = z.infer<typeof mentoresPublicoQuerySchema>;
export type ListarMentoresQuery = z.infer<typeof listarMentoresQuerySchema>;
