import { Router } from "express";
import { listar } from "./oportunidades.controller";
import { listarOportunidadesQuerySchema } from "./oportunidades.schema";
import { validateQuery } from "../../middlewares/validate";

export const oportunidadesRouter = Router();

oportunidadesRouter.get("/", validateQuery(listarOportunidadesQuerySchema), listar);
