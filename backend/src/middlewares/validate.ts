import { NextFunction, Request, Response } from "express";
import { ZodType } from "zod";
import { AppError } from "../shared/errors/AppError";

export function validateQuery(schema: ZodType) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query);

    if (!result.success) {
      next(
        new AppError(
          400,
          "Parâmetros de consulta inválidos.",
          "VALIDACAO_INVALIDA",
        ),
      );
      return;
    }

    res.locals.query = result.data;
    next();
  };
}

export function validateBody(schema: ZodType) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      next(
        new AppError(400, "Dados do pedido inválidos.", "VALIDACAO_INVALIDA"),
      );
      return;
    }

    res.locals.body = result.data;
    next();
  };
}
