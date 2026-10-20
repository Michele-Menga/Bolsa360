import { NextFunction, Request, Response } from "express";
import {
  arquivarOportunidade,
  atualizarOportunidade,
  criarOportunidade,
  listarOportunidadesAdmin,
  obterOportunidadeAdmin,
  publicarOportunidade,
} from "./administracao.service";
import {
  AtualizarOportunidadeInput,
  CriarOportunidadeInput,
  ListarAdminQuery,
} from "./administracao.schema";
import { UtilizadorAutenticado } from "../autenticacao/autenticacao.types";

export async function listar(req: Request, res: Response, next: NextFunction) {
  try {
    const resposta = await listarOportunidadesAdmin(
      res.locals.query as ListarAdminQuery,
    );
    res.json(resposta);
  } catch (erro) {
    next(erro);
  }
}

export async function criar(req: Request, res: Response, next: NextFunction) {
  try {
    const administrador = res.locals.utilizador as UtilizadorAutenticado;
    const dados = res.locals.body as CriarOportunidadeInput;
    const criada = await criarOportunidade(administrador.id, dados);
    res.status(201).json({ data: criada });
  } catch (erro) {
    next(erro);
  }
}

export async function obter(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = res.locals.params as { id: string };
    const dados = await obterOportunidadeAdmin(id);
    res.json({ data: dados });
  } catch (erro) {
    next(erro);
  }
}

export async function atualizar(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = res.locals.params as { id: string };
    const dados = res.locals.body as AtualizarOportunidadeInput;
    const atualizada = await atualizarOportunidade(id, dados);
    res.json({ data: atualizada });
  } catch (erro) {
    next(erro);
  }
}

export async function publicar(req: Request, res: Response, next: NextFunction) {
  try {
    const administrador = res.locals.utilizador as UtilizadorAutenticado;
    const { id } = res.locals.params as { id: string };
    const publicada = await publicarOportunidade(id, administrador.id);
    res.json({ data: publicada });
  } catch (erro) {
    next(erro);
  }
}

export async function arquivar(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = res.locals.params as { id: string };
    const arquivada = await arquivarOportunidade(id);
    res.json({ data: arquivada });
  } catch (erro) {
    next(erro);
  }
}
