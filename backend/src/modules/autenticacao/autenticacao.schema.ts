import { z } from "zod";

export const registoSchema = z
  .object({
    nome: z.string().trim().min(2).max(120),
    email: z.email().max(254),
    palavraPasse: z.string().min(8).max(200),


    // Só CANDIDATO ou MENTOR podem ser escolhidos no registo; ADMIN nunca.
    papel: z.enum(["CANDIDATO", "MENTOR"]).default("CANDIDATO"),
    biografia: z.string().trim().max(2000).optional(),
    especialidades: z.array(z.string().trim().min(2).max(60)).max(10).optional(),
  })
  .strict();

export const loginSchema = z
  .object({
    email: z.email().max(254),
    palavraPasse: z.string().min(1).max(200),
  })
  .strict();

export type RegistoInput = z.infer<typeof registoSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
