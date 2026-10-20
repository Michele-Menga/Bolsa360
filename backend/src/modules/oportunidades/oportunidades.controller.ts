import { Request, Response, NextFunction } from "express";
import { listarOportunidades, obterOportunidade } from "./oportunidades.service";
import { ListarOportunidadesQuery } from "./oportunidades.schema";

export async function listar(req: Request, res: Response, next: NextFunction) {
  try {
    const resposta = await listarOportunidades(
      res.locals.query as ListarOportunidadesQuery,
    );
    res.json(resposta);
  } catch (erro) {
    next(erro);
  }
}

export async function obter(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = res.locals.params as { id: string };
    const dados = await obterOportunidade(id);
    res.json({ data: dados });
  } catch (erro) {
    next(erro);
  }
}
