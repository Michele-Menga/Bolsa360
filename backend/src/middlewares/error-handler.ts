import { Request, Response, NextFunction } from "express";
import { AppError } from "../shared/errors/AppError";

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      erro: { codigo: err.code, mensagem: err.message },
    });
    return;
  }

  console.error(err); // fica só no servidor
  res.status(500).json({
    erro: { codigo: "ERRO_INTERNO", mensagem: "Erro interno do servidor" },
  });
}
