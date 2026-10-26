import { NextFunction, Request, RequestHandler, Response } from "express";
import * as svc from "./mentoria.service";
import type { AgendaQuery, AgendarSessaoInput, AtualizarMentorInput, AtualizarServicoInput, CriarServicoInput, ListarMentoresQuery, MentoresPublicoQuery } from "./mentoria.schema";
import type { UtilizadorAutenticado } from "../autenticacao/autenticacao.types";

type H = (req: Request, res: Response, utilizador: UtilizadorAutenticado) => Promise<unknown>;
const tratar = (fn: H, estado = 200): RequestHandler => async (req: Request, res: Response, next: NextFunction) => {
  try {
    const resultado = await fn(req, res, res.locals.utilizador as UtilizadorAutenticado);
    // listas paginadas já trazem { data, meta }; o resto vai embrulhado em { data }
    res.status(estado).json(resultado && typeof resultado === "object" && "meta" in resultado ? resultado : { data: resultado });
  } catch (erro) {
    next(erro);
  }
};
const idDe = (res: Response) => (res.locals.params as { id: string }).id;
const body = <T>(res: Response) => res.locals.body as T;

// Mentor
export const obterMeu = tratar((_q, _r, u) => svc.obterMentor(u.id));
export const atualizarMeu = tratar((_q, res, u) => svc.atualizarMentor(u.id, body<AtualizarMentorInput>(res)));
export const listarServicos = tratar((_q, _r, u) => svc.listarServicos(u.id));
export const criarServico = tratar((_q, res, u) => svc.criarServico(u.id, body<CriarServicoInput>(res)), 201);
export const atualizarServico = tratar((_q, res, u) => svc.atualizarServico(u.id, idDe(res), body<AtualizarServicoInput>(res)));
export const listarAgenda = tratar((_q, res, u) => svc.listarAgenda(u.id, res.locals.query as AgendaQuery));
export const aceitar = tratar((req, res, u) => svc.aceitarAgendamento(u.id, idDe(res), req.ip));
export const recusar = tratar((req, res, u) => svc.recusarAgendamento(u.id, idDe(res), (res.locals.body as { motivo?: string } | undefined)?.motivo, req.ip));
export const concluir = tratar((req, res, u) => svc.concluirAgendamento(u.id, idDe(res), req.ip));
export const cancelar = tratar((req, res, u) => svc.cancelarAgendamento(u.id, idDe(res), body<{ motivo: string }>(res).motivo, req.ip));

// Admin
export const listarMentoresAdmin = tratar((_q, res) => svc.listarMentoresAdmin(res.locals.query as ListarMentoresQuery));
export const verificarMentor = tratar((req, res, u) => svc.verificarMentor(u.id, idDe(res), body<{ estado: "PENDENTE" | "VERIFICADA" | "REJEITADA" }>(res).estado, req.ip));

// Estudante / Público
export const listarMentoresPublico = tratar((_q, res) => svc.listarMentoresPublico(res.locals.query as MentoresPublicoQuery));
export const agendarSessao = tratar((_q, res, u) => svc.agendarSessaoCandidato(u.id, body<AgendarSessaoInput>(res)), 201);
export const listarMinhasMentorias = tratar((_q, _r, u) => svc.listarAgendamentosCandidato(u.id));
export const cancelarMinhaMentoria = tratar((_q, res, u) => svc.cancelarAgendamentoCandidato(u.id, idDe(res), body<{ motivo: string }>(res).motivo));

