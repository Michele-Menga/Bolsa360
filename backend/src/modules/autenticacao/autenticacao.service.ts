import argon2 from "argon2";
import { Papel, Prisma } from "@prisma/client";
import { prisma } from "../../config/database";
import { AppError } from "../../shared/errors/AppError";
import { normalizarEmail } from "../../shared/utils/email";
import { LoginInput, RegistoInput } from "./autenticacao.schema";

export type UtilizadorPublico = {
  id: string;
  nome: string;
  email: string;
  papel: Papel;
};

export async function registar(dados: RegistoInput): Promise<UtilizadorPublico> {
  const email = normalizarEmail(dados.email);

  const existente = await prisma.utilizador.findUnique({ where: { email } });
  if (existente) {
    throw new AppError(409, "Já existe uma conta com este email.", "EMAIL_JA_EXISTE");
  }

  const palavraPasseHash = await argon2.hash(dados.palavraPasse, {
    type: argon2.argon2id,
  });

  try {
    return await prisma.utilizador.create({
      data: {
        nome: dados.nome,
        email,
        palavraPasseHash,
        papel: dados.papel,
        // Mentor nasce com o registo de mentor em verificação (PENDENTE por omissão no schema).
        ...(dados.papel === "MENTOR" && {
          mentor: { create: { biografia: dados.biografia ?? "", especialidades: dados.especialidades ?? [] } },
        }),
      },
      select: { id: true, nome: true, email: true, papel: true },
    });
  } catch (erro) {
    if (erro instanceof Prisma.PrismaClientKnownRequestError && erro.code === "P2002") {
      throw new AppError(409, "Já existe uma conta com este email.", "EMAIL_JA_EXISTE");
    }
    throw erro;
  }
}

export async function autenticar(dados: LoginInput): Promise<UtilizadorPublico> {
  const email = normalizarEmail(dados.email);

  const utilizador = await prisma.utilizador.findUnique({ where: { email } });
  if (!utilizador) {
    throw new AppError(401, "Credenciais inválidas.", "CREDENCIAIS_INVALIDAS");
  }

  const palavraPasseCerta = await argon2.verify(
    utilizador.palavraPasseHash,
    dados.palavraPasse,
  );
  if (!palavraPasseCerta) {
    throw new AppError(401, "Credenciais inválidas.", "CREDENCIAIS_INVALIDAS");
  }

  if (utilizador.estado !== "ATIVO") {
    throw new AppError(403, "A conta não está ativa.", "CONTA_NAO_ATIVA");
  }

  return {
    id: utilizador.id,
    nome: utilizador.nome,
    email: utilizador.email,
    papel: utilizador.papel,
  };
}
