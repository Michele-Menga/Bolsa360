import { Request, Response, NextFunction } from "express";
import { AppError } from "../shared/errors/AppError";

export function notFound(req: Request, res: Response, next: NextFunction) {
  next(new AppError(404, "Recurso não encontrado", "NAO_ENCONTRADO"));
}