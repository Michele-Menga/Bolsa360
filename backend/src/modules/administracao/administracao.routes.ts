import { Router } from "express";
import { z } from "zod";
import { Papel } from "@prisma/client";
import {
  arquivar,
  atualizar,
  criar,
  listar,
  metricas,
  obter,
  publicar,
} from "./administracao.controller";
import {
  atualizarOportunidadeSchema,
  criarOportunidadeSchema,
  listarAdminQuerySchema,
} from "./administracao.schema";
import { authenticate } from "../../middlewares/authenticate";
import { authorize } from "../../middlewares/authorize";
import { validateBody, validateParams, validateQuery } from "../../middlewares/validate";

export const administracaoRouter = Router();

const idParamSchema = z.object({ id: z.uuid() });

administracaoRouter.use(authenticate, authorize(Papel.ADMIN));

administracaoRouter.get("/metricas", metricas);
administracaoRouter.get("/oportunidades", validateQuery(listarAdminQuerySchema), listar);
administracaoRouter.post(
  "/oportunidades",
  validateBody(criarOportunidadeSchema),
  criar,
);
administracaoRouter.get("/oportunidades/:id", validateParams(idParamSchema), obter);
administracaoRouter.patch(
  "/oportunidades/:id",
  validateParams(idParamSchema),
  validateBody(atualizarOportunidadeSchema),
  atualizar,
);
administracaoRouter.post(
  "/oportunidades/:id/publicar",
  validateParams(idParamSchema),
  publicar,
);
administracaoRouter.post(
  "/oportunidades/:id/arquivar",
  validateParams(idParamSchema),
  arquivar,
);
