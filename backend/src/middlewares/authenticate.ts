import { NextFunction, Request, Response } from "express";
import { prisma } from "../config/database";
import { AppError } from "../shared/errors/AppError";
import {
  UtilizadorAutenticado,
} from "../modules/autenticacao/autenticacao.types";
import {
  NOME_COOKIE_SESSAO,
  verificarTokenSessao,
} from "../modules/autenticacao/sessao";

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.[NOME_COOKIE_SESSAO];
    if (!token) {
      throw new AppError(401, "Sessão não encontrada.", "NAO_AUTENTICADO");
    }

    let utilizadorId: string;
    try {
      utilizadorId = verificarTokenSessao(token);
    } catch {
      throw new AppError(401, "Sessão inválida ou expirada.", "NAO_AUTENTICADO");
    }

    const utilizador = await prisma.utilizador.findUnique({
      where: { id: utilizadorId },
      select: { id: true, nome: true, email: true, papel: true, estado: true },
    });

    if (!utilizador) {
      throw new AppError(401, "Sessão inválida ou expirada.", "NAO_AUTENTICADO");
    }

    if (utilizador.estado !== "ATIVO") {
      throw new AppError(403, "A conta não está ativa.", "CONTA_NAO_ATIVA");
    }

    const autenticado: UtilizadorAutenticado = {
      id: utilizador.id,
      nome: utilizador.nome,
      email: utilizador.email,
      papel: utilizador.papel,
    };

    res.locals.utilizador = autenticado;
    next();
  } catch (erro) {
    next(erro);
  }
}
