import { CookieOptions } from "express";
import jwt from "jsonwebtoken";
import { env } from "../../config/env";

export const NOME_COOKIE_SESSAO = "bolsa360_sessao";

const DURACAO_SESSAO_SEGUNDOS = 60 * 60 * 24 * 7;

export function criarTokenSessao(utilizadorId: string): string {
  return jwt.sign({ sub: utilizadorId }, env.SESSION_SECRET, {
    expiresIn: DURACAO_SESSAO_SEGUNDOS,
  });
}

export function verificarTokenSessao(token: string): string {
  const payload = jwt.verify(token, env.SESSION_SECRET);

  if (typeof payload === "string" || typeof payload.sub !== "string") {
    throw new Error("Token de sessão inválido.");
  }

  return payload.sub;
}

export function opcoesCookieSessao(): CookieOptions {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: env.NODE_ENV === "production",
    maxAge: DURACAO_SESSAO_SEGUNDOS * 1000,
    path: "/",
  };
}

export function opcoesRemoverCookie(): CookieOptions {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: env.NODE_ENV === "production",
    path: "/",
  };
}
