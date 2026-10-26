import { Router } from "express";
import { z } from "zod";
import { Papel } from "@prisma/client";
import * as c from "./mentoria.controller";
import {
  agendaQuerySchema, agendarSessaoSchema, atualizarMentorSchema, atualizarServicoSchema, cancelarAgendamentoSchema,
  criarServicoSchema, listarMentoresQuerySchema, mentoresPublicoQuerySchema, recusarAgendamentoSchema, verificarMentorSchema,
} from "./mentoria.schema";
import { authenticate } from "../../middlewares/authenticate";
import { authorize } from "../../middlewares/authorize";
import { validateBody, validateParams, validateQuery } from "../../middlewares/validate";

const idParam = validateParams(z.object({ id: z.uuid() }));

/** /api/v1/mentor — área do mentor autenticado. */
export const mentorRouter = Router();
mentorRouter.use(authenticate, authorize(Papel.MENTOR));
mentorRouter.get("/me", c.obterMeu);
mentorRouter.put("/me", validateBody(atualizarMentorSchema), c.atualizarMeu);
mentorRouter.get("/servicos", c.listarServicos);
mentorRouter.post("/servicos", validateBody(criarServicoSchema), c.criarServico);
mentorRouter.patch("/servicos/:id", idParam, validateBody(atualizarServicoSchema), c.atualizarServico);
mentorRouter.get("/agenda", validateQuery(agendaQuerySchema), c.listarAgenda);
mentorRouter.post("/agenda/:id/aceitar", idParam, c.aceitar);
mentorRouter.post("/agenda/:id/recusar", idParam, validateBody(recusarAgendamentoSchema), c.recusar);
mentorRouter.post("/agenda/:id/concluir", idParam, c.concluir);
mentorRouter.post("/agenda/:id/cancelar", idParam, validateBody(cancelarAgendamentoSchema), c.cancelar);

/** /api/v1/admin/mentores — verificação de mentores pelo administrador. */
export const mentoresAdminRouter = Router();
mentoresAdminRouter.use(authenticate, authorize(Papel.ADMIN));
mentoresAdminRouter.get("/", validateQuery(listarMentoresQuerySchema), c.listarMentoresAdmin);
mentoresAdminRouter.patch("/:id/verificacao", idParam, validateBody(verificarMentorSchema), c.verificarMentor);

/** /api/v1/mentores — catálogo público de mentores e seus serviços. */
export const mentoresPublicoRouter = Router();
mentoresPublicoRouter.get("/", validateQuery(mentoresPublicoQuerySchema), c.listarMentoresPublico);

/** /api/v1/candidato/mentorias — agendamento e gestão de mentorias pelo estudante. */
export const candidatoMentoriaRouter = Router();
candidatoMentoriaRouter.use(authenticate, authorize(Papel.CANDIDATO));
candidatoMentoriaRouter.get("/", c.listarMinhasMentorias);
candidatoMentoriaRouter.post("/agendar", validateBody(agendarSessaoSchema), c.agendarSessao);
candidatoMentoriaRouter.post("/:id/cancelar", idParam, validateBody(cancelarAgendamentoSchema), c.cancelarMinhaMentoria);

