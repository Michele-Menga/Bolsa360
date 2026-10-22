import { Router } from "express";
import { z } from "zod";
import { adicionar, listar, remover } from "./favoritos.controller";
import { authenticate } from "../../middlewares/authenticate";
import { validateParams } from "../../middlewares/validate";

export const favoritosRouter = Router();

const oportunidadeParamSchema = z.object({ oportunidadeId: z.uuid() });

favoritosRouter.use(authenticate);

favoritosRouter.get("/", listar);
favoritosRouter.post(
  "/:oportunidadeId",
  validateParams(oportunidadeParamSchema),
  adicionar,
);
favoritosRouter.delete(
  "/:oportunidadeId",
  validateParams(oportunidadeParamSchema),
  remover,
);
