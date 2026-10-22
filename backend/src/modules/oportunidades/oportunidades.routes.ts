import { Router } from "express";
import { z } from "zod";
import { listar, obter } from "./oportunidades.controller";
import { listarOportunidadesQuerySchema } from "./oportunidades.schema";
import { validateParams, validateQuery } from "../../middlewares/validate";

export const oportunidadesRouter = Router();

const idParamSchema = z.object({ id: z.uuid() });

oportunidadesRouter.get("/", validateQuery(listarOportunidadesQuerySchema), listar);
oportunidadesRouter.get("/:id", validateParams(idParamSchema), obter);
