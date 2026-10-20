import { Router } from "express";
import { Papel } from "@prisma/client";
import { guardar, obter } from "./perfis.controller";
import { atualizarPerfilSchema } from "./perfis.schema";
import { authenticate } from "../../middlewares/authenticate";
import { authorize } from "../../middlewares/authorize";
import { validateBody } from "../../middlewares/validate";

export const perfisRouter = Router();

perfisRouter.use(authenticate, authorize(Papel.CANDIDATO));

perfisRouter.get("/me", obter);
perfisRouter.put("/me", validateBody(atualizarPerfilSchema), guardar);
