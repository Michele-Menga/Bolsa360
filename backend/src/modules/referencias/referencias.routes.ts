import { Router } from "express";
import { listar } from "./referencias.controller";

export const referenciasRouter = Router();

// Público e só de leitura: não expõe dados pessoais.
referenciasRouter.get("/", listar);
