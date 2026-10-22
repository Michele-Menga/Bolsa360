import { NextFunction, Request, Response } from "express";
import { autenticar, registar } from "./autenticacao.service";
import { LoginInput, RegistoInput } from "./autenticacao.schema";
import {
  NOME_COOKIE_SESSAO,
  criarTokenSessao,
  opcoesCookieSessao,
  opcoesRemoverCookie,
} from "./sessao";
import { UtilizadorAutenticado } from "./autenticacao.types";

export async function criarConta(req: Request, res: Response, next: NextFunction) {
  try {
    const dados = res.locals.body as RegistoInput;
    const utilizador = await registar(dados);

    res.cookie(NOME_COOKIE_SESSAO, criarTokenSessao(utilizador.id), opcoesCookieSessao());
    res.status(201).json({ data: utilizador });
  } catch (erro) {
    next(erro);
  }
}

export async function iniciarSessao(req: Request, res: Response, next: NextFunction) {
  try {
    const dados = res.locals.body as LoginInput;
    const utilizador = await autenticar(dados);

    res.cookie(NOME_COOKIE_SESSAO, criarTokenSessao(utilizador.id), opcoesCookieSessao());
    res.json({ data: utilizador });
  } catch (erro) {
    next(erro);
  }
}

export function terminarSessao(_req: Request, res: Response) {
  res.clearCookie(NOME_COOKIE_SESSAO, opcoesRemoverCookie());
  res.json({ ok: true });
}

export function obterSessao(_req: Request, res: Response) {
  const utilizador = res.locals.utilizador as UtilizadorAutenticado;
  res.json({ data: utilizador });
}
