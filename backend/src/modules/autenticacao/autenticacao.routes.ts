import { Router } from "express";
import {
  criarConta,
  iniciarSessao,
  obterSessao,
  terminarSessao,
} from "./autenticacao.controller";
import { loginSchema, registoSchema } from "./autenticacao.schema";
import { validateBody } from "../../middlewares/validate";
import { authenticate } from "../../middlewares/authenticate";
import { limitarLogin } from "../../middlewares/rate-limit";

export const autenticacaoRouter = Router();

autenticacaoRouter.post("/register", validateBody(registoSchema), criarConta);
autenticacaoRouter.post("/login", limitarLogin, validateBody(loginSchema), iniciarSessao);
autenticacaoRouter.post("/logout", terminarSessao);
autenticacaoRouter.get("/me", authenticate, obterSessao);
