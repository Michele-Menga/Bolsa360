import { NextFunction, Request, Response } from "express";
import {
  atualizarCandidatura,
  criarCandidatura,
  listarCandidaturas,
  obterCandidatura,
} from "./candidaturas.service";
import {
  AtualizarCandidaturaInput,
  CriarCandidaturaInput,
} from "./candidaturas.schema";
import { UtilizadorAutenticado } from "../autenticacao/autenticacao.types";

export async function listar(_req: Request, res: Response, next: NextFunction) {
  try {
    const utilizador = res.locals.utilizador as UtilizadorAutenticado;
    const dados = await listarCandidaturas(utilizador.id);
    res.json({ data: dados });
  } catch (erro) {
    next(erro);
  }
}

export async function obter(req: Request, res: Response, next: NextFunction) {
  try {
    const utilizador = res.locals.utilizador as UtilizadorAutenticado;
    const { id } = res.locals.params as { id: string };
    const dados = await obterCandidatura(utilizador.id, id);
    res.json({ data: dados });
  } catch (erro) {
    next(erro);
  }
}

export async function criar(req: Request, res: Response, next: NextFunction) {
  try {
    const utilizador = res.locals.utilizador as UtilizadorAutenticado;
    const { oportunidadeId } = res.locals.body as CriarCandidaturaInput;
    const criada = await criarCandidatura(utilizador.id, oportunidadeId);
    res.status(201).json({ data: criada });
  } catch (erro) {
    next(erro);
  }
}

export async function atualizar(req: Request, res: Response, next: NextFunction) {
  try {
    const utilizador = res.locals.utilizador as UtilizadorAutenticado;
    const { id } = res.locals.params as { id: string };
    const dados = res.locals.body as AtualizarCandidaturaInput;
    const atualizada = await atualizarCandidatura(utilizador.id, id, dados);
    res.json({ data: atualizada });
  } catch (erro) {
    next(erro);
  }
}
