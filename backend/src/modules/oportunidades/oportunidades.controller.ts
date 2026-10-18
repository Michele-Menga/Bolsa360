import { Request, Response, NextFunction } from "express";
import { listarOportunidades } from "./oportunidades.service";
import { ListarOportunidadesQuery } from "./oportunidades.schema";

export async function listar(req: Request, res: Response, next: NextFunction) {
  try {
    const resposta = await listarOportunidades(res.locals.query as ListarOportunidadesQuery);
    res.json(resposta);
  } catch (erro) {
    next(erro);
  }
}
