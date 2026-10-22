import { Router } from "express";
import { z } from "zod";
import { atualizar, criar, listar, obter } from "./candidaturas.controller";
import {
  atualizarCandidaturaSchema,
  criarCandidaturaSchema,
} from "./candidaturas.schema";
import { authenticate } from "../../middlewares/authenticate";
import { validateBody, validateParams } from "../../middlewares/validate";

export const candidaturasRouter = Router();

const idParamSchema = z.object({ id: z.uuid() });

candidaturasRouter.use(authenticate);

candidaturasRouter.get("/", listar);
candidaturasRouter.post("/", validateBody(criarCandidaturaSchema), criar);
candidaturasRouter.get("/:id", validateParams(idParamSchema), obter);
candidaturasRouter.patch(
  "/:id",
  validateParams(idParamSchema),
  validateBody(atualizarCandidaturaSchema),
  atualizar,
);
