import { NextFunction, Request, Response } from "express";
import { guardarPerfil, obterPerfil } from "./perfis.service";
import { AtualizarPerfilInput } from "./perfis.schema";
import { UtilizadorAutenticado } from "../autenticacao/autenticacao.types";

export async function obter(req: Request, res: Response, next: NextFunction) {
  try {
    const utilizador = res.locals.utilizador as UtilizadorAutenticado;
    const dados = await obterPerfil(utilizador.id);
    res.json({ data: dados });
  } catch (erro) {
    next(erro);
  }
}

export async function guardar(req: Request, res: Response, next: NextFunction) {
  try {
    const utilizador = res.locals.utilizador as UtilizadorAutenticado;
    const dados = res.locals.body as AtualizarPerfilInput;
    const perfil = await guardarPerfil(utilizador.id, dados);
    res.json({ data: perfil });
  } catch (erro) {
    next(erro);
  }
}
