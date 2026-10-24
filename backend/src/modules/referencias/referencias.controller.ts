import { NextFunction, Request, Response } from "express";
import { obterReferencias } from "./referencias.service";

export async function listar(_req: Request, res: Response, next: NextFunction) {
  try {
    const dados = await obterReferencias();
    // Dados quase estáticos: o browser pode guardá-los alguns minutos.
    res.set("Cache-Control", "public, max-age=300");
    res.json({ data: dados });
  } catch (erro) {
    next(erro);
  }
}
