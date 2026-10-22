import { NextFunction, Request, Response } from "express";
import {
  adicionarFavorito,
  listarFavoritos,
  removerFavorito,
} from "./favoritos.service";
import { UtilizadorAutenticado } from "../autenticacao/autenticacao.types";

export async function listar(_req: Request, res: Response, next: NextFunction) {
  try {
    const utilizador = res.locals.utilizador as UtilizadorAutenticado;
    const dados = await listarFavoritos(utilizador.id);
    res.json({ data: dados });
  } catch (erro) {
    next(erro);
  }
}

export async function adicionar(req: Request, res: Response, next: NextFunction) {
  try {
    const utilizador = res.locals.utilizador as UtilizadorAutenticado;
    const { oportunidadeId } = res.locals.params as { oportunidadeId: string };
    const resultado = await adicionarFavorito(utilizador.id, oportunidadeId);
    res.status(201).json(resultado);
  } catch (erro) {
    next(erro);
  }
}

export async function remover(req: Request, res: Response, next: NextFunction) {
  try {
    const utilizador = res.locals.utilizador as UtilizadorAutenticado;
    const { oportunidadeId } = res.locals.params as { oportunidadeId: string };
    const resultado = await removerFavorito(utilizador.id, oportunidadeId);
    res.json(resultado);
  } catch (erro) {
    next(erro);
  }
}
