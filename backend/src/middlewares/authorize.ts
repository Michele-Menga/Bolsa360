import { NextFunction, Request, Response } from "express";
import { Papel } from "@prisma/client";
import { AppError } from "../shared/errors/AppError";
import { UtilizadorAutenticado } from "../modules/autenticacao/autenticacao.types";

export function authorize(...papeis: Papel[]) {
  return (_req: Request, res: Response, next: NextFunction) => {
    const utilizador = res.locals.utilizador as UtilizadorAutenticado | undefined;

    if (!utilizador) {
      next(new AppError(401, "Autenticação necessária.", "NAO_AUTENTICADO"));
      return;
    }

    if (!papeis.includes(utilizador.papel)) {
      next(new AppError(403, "Não tem permissão para esta operação.", "SEM_PERMISSAO"));
      return;
    }

    next();
  };
}
