import { EstadoVerificacao, Mentor, Prisma, ServicoMentoria } from "@prisma/client";
import { prisma } from "../../config/database";
import { AppError } from "../../shared/errors/AppError";
import { registarAuditoria } from "../auditoria/auditoria.repository";
import type {
  AgendaQuery,
  AgendarSessaoInput,
  AtualizarMentorInput,
  AtualizarServicoInput,
  CriarServicoInput,
  ListarMentoresQuery,
  MentoresPublicoQuery,
} from "./mentoria.schema";

/** O registo de mentor nasce no registo da conta; o upsert evita um beco sem saída se faltar. */
async function mentorDe(utilizadorId: string): Promise<Mentor> {
  return prisma.mentor.upsert({
    where: { utilizadorId },
    update: {},
    create: { utilizadorId, biografia: "", especialidades: [] },
  });
}

const verificado = (m: Mentor) => m.estadoVerificacao === EstadoVerificacao.VERIFICADA;

function serializarMentor(m: Mentor) {
  return {
    id: m.id,
    biografia: m.biografia,
    especialidades: m.especialidades,
    estadoVerificacao: m.estadoVerificacao,
    perfilCompleto: m.biografia.trim().length >= 20 && m.especialidades.length > 0,
    criadoEm: m.criadoEm,
  };
}

function serializarServico(s: ServicoMentoria, m: Mentor) {
  return {
    id: s.id,
    titulo: s.titulo,
    descricao: s.descricao,
    duracaoMinutos: s.duracaoMinutos,
    preco: s.preco.toString(),
    moeda: s.moeda,
    ativo: s.ativo,
    // Só se vende/agenda com mentor verificado (relatório de sincronização, regra de mentores).
    visivelParaCandidatos: s.ativo && verificado(m),
    criadoEm: s.criadoEm,
    atualizadoEm: s.atualizadoEm,
  };
}

// ---------------- Perfil do mentor ----------------
export async function obterMentor(utilizadorId: string) {
  return serializarMentor(await mentorDe(utilizadorId));
}

export async function atualizarMentor(utilizadorId: string, dados: AtualizarMentorInput) {
  const mentor = await mentorDe(utilizadorId);
  const atualizado = await prisma.mentor.update({
    where: { id: mentor.id },
    data: {
      ...(dados.biografia !== undefined && { biografia: dados.biografia }),
      ...(dados.especialidades !== undefined && { especialidades: dados.especialidades }),
    },
  });
  return serializarMentor(atualizado);
}

// ---------------- Serviços ----------------
export async function listarServicos(utilizadorId: string) {
  const mentor = await mentorDe(utilizadorId);
  const servicos = await prisma.servicoMentoria.findMany({
    where: { mentorId: mentor.id, tipo: "PERSONALIZADA" },
    orderBy: { criadoEm: "desc" },
  });
  return servicos.map((s) => serializarServico(s, mentor));
}

export async function criarServico(utilizadorId: string, dados: CriarServicoInput) {
  const mentor = await mentorDe(utilizadorId);
  const criado = await prisma.servicoMentoria.create({
    data: { ...dados, mentorId: mentor.id, tipo: "PERSONALIZADA" },
  });
  return serializarServico(criado, mentor);
}

export async function atualizarServico(utilizadorId: string, id: string, dados: AtualizarServicoInput) {
  const mentor = await mentorDe(utilizadorId);
  const existente = await prisma.servicoMentoria.findFirst({
    where: { id, mentorId: mentor.id, tipo: "PERSONALIZADA" },
  });
  if (!existente) throw new AppError(404, "Serviço não encontrado.", "SERVICO_NAO_ENCONTRADO");
  const atualizado = await prisma.servicoMentoria.update({ where: { id }, data: dados });
  return serializarServico(atualizado, mentor);
}

// ---------------- Agenda ----------------
async function agendamentoDoMentor(mentorId: string, id: string) {
  const a = await prisma.agendamentoMentoria.findFirst({ where: { id, mentorId } });
  if (!a) throw new AppError(404, "Sessão não encontrada.", "AGENDAMENTO_NAO_ENCONTRADO");
  return a;
}

export async function listarAgenda(utilizadorId: string, { estado }: AgendaQuery) {
  const mentor = await mentorDe(utilizadorId);
  const where: Prisma.AgendamentoMentoriaWhereInput = { mentorId: mentor.id, ...(estado && { estado }) };
  const itens = await prisma.agendamentoMentoria.findMany({
    where,
    orderBy: { inicio: "asc" },
    take: 200,
    include: { servico: { select: { titulo: true, duracaoMinutos: true } }, candidato: { select: { nome: true } } },
  });
  return itens.map((a) => ({
    id: a.id,
    estado: a.estado,
    inicio: a.inicio,
    fim: a.fim,
    expiraEm: a.expiraEm,
    servico: a.servico,
    candidato: { nome: a.candidato.nome },
    // O link só aparece ao mentor e ao candidato da sessão, e só depois do pagamento confirmado.
    linkReuniao: a.estado === "CONFIRMADO" || a.estado === "CONCLUIDO" ? a.linkReuniao : null,
    aguardaLink: a.estado === "CONFIRMADO" && !a.linkReuniao,
    motivoCancelamento: a.motivoCancelamento,
  }));
}

export async function concluirAgendamento(utilizadorId: string, id: string, ip?: string) {
  const mentor = await mentorDe(utilizadorId);
  const a = await agendamentoDoMentor(mentor.id, id);
  if (a.estado !== "CONFIRMADO") {
    throw new AppError(409, "Só é possível concluir sessões confirmadas.", "AGENDAMENTO_ESTADO_INVALIDO");
  }
  if (a.inicio.getTime() > Date.now()) {
    throw new AppError(409, "A sessão ainda não começou.", "SESSAO_AINDA_NAO_COMECOU");
  }
  return prisma.$transaction(async (tx) => {
    const r = await tx.agendamentoMentoria.update({ where: { id }, data: { estado: "CONCLUIDO" } });
    await registarAuditoria(tx, { atorUtilizadorId: utilizadorId, acao: "CONCLUIR_AGENDAMENTO", tipoEntidade: "AgendamentoMentoria", entidadeId: id, enderecoIp: ip });
    return { id: r.id, estado: r.estado };
  });
}

export async function aceitarAgendamento(utilizadorId: string, id: string, ip?: string) {
  const mentor = await mentorDe(utilizadorId);
  const a = await agendamentoDoMentor(mentor.id, id);
  if (a.estado !== "PENDENTE_PAGAMENTO") {
    throw new AppError(409, "Apenas solicitações pendentes podem ser aceites.", "AGENDAMENTO_ESTADO_INVALIDO");
  }

  const hash = Math.random().toString(36).substring(2, 10);
  const linkReuniao = a.linkReuniao || `https://meet.jit.si/bolsa360-mentoria-${hash}`;

  return prisma.$transaction(async (tx) => {
    const r = await tx.agendamentoMentoria.update({
      where: { id },
      data: {
        estado: "CONFIRMADO",
        linkReuniao,
      },
      include: {
        servico: { select: { titulo: true, duracaoMinutos: true } },
        candidato: { select: { nome: true } },
      },
    });
    await registarAuditoria(tx, {
      atorUtilizadorId: utilizadorId,
      acao: "ACEITAR_AGENDAMENTO",
      tipoEntidade: "AgendamentoMentoria",
      entidadeId: id,
      enderecoIp: ip,
    });
    return {
      id: r.id,
      estado: r.estado,
      linkReuniao: r.linkReuniao,
      servico: r.servico,
      candidato: r.candidato,
    };
  });
}

export async function recusarAgendamento(utilizadorId: string, id: string, motivo?: string, ip?: string) {
  const mentor = await mentorDe(utilizadorId);
  const a = await agendamentoDoMentor(mentor.id, id);
  if (a.estado !== "PENDENTE_PAGAMENTO") {
    throw new AppError(409, "Apenas solicitações pendentes podem ser recusadas.", "AGENDAMENTO_ESTADO_INVALIDO");
  }

  const motivoFinal = motivo?.trim() || "Solicitação não aceite pelo mentor.";
  return prisma.$transaction(async (tx) => {
    const r = await tx.agendamentoMentoria.update({
      where: { id },
      data: {
        estado: "CANCELADO",
        motivoCancelamento: motivoFinal,
      },
      include: {
        servico: { select: { titulo: true, duracaoMinutos: true } },
        candidato: { select: { nome: true } },
      },
    });
    await registarAuditoria(tx, {
      atorUtilizadorId: utilizadorId,
      acao: "RECUSAR_AGENDAMENTO",
      tipoEntidade: "AgendamentoMentoria",
      entidadeId: id,
      detalhesMinimos: { motivo: motivoFinal },
      enderecoIp: ip,
    });
    return {
      id: r.id,
      estado: r.estado,
      motivoCancelamento: r.motivoCancelamento,
    };
  });
}

export async function cancelarAgendamento(utilizadorId: string, id: string, motivo: string, ip?: string) {
  const mentor = await mentorDe(utilizadorId);
  const a = await agendamentoDoMentor(mentor.id, id);
  if (a.estado !== "PENDENTE_PAGAMENTO" && a.estado !== "CONFIRMADO") {
    throw new AppError(409, "Esta sessão já não pode ser cancelada.", "AGENDAMENTO_ESTADO_INVALIDO");
  }
  return prisma.$transaction(async (tx) => {
    const r = await tx.agendamentoMentoria.update({ where: { id }, data: { estado: "CANCELADO", motivoCancelamento: motivo } });
    await registarAuditoria(tx, { atorUtilizadorId: utilizadorId, acao: "CANCELAR_AGENDAMENTO", tipoEntidade: "AgendamentoMentoria", entidadeId: id, detalhesMinimos: { anterior: a.estado }, enderecoIp: ip });
    // MVP: reembolso manual (decisão do relatório de mentoria). O sistema não mexe no pagamento.
    return { id: r.id, estado: r.estado, reembolsoManual: a.estado === "CONFIRMADO" };
  });
}

// ---------------- Administração de mentores ----------------
export async function listarMentoresAdmin({ estado, pagina, limite }: ListarMentoresQuery) {
  const where: Prisma.MentorWhereInput = estado ? { estadoVerificacao: estado } : {};
  const [total, itens] = await Promise.all([
    prisma.mentor.count({ where }),
    prisma.mentor.findMany({
      where, orderBy: [{ estadoVerificacao: "asc" }, { criadoEm: "desc" }], skip: (pagina - 1) * limite, take: limite,
      include: { utilizador: { select: { nome: true, email: true } }, _count: { select: { servicos: true } } },
    }),
  ]);
  return {
    data: itens.map((m) => ({
      id: m.id, nome: m.utilizador.nome, email: m.utilizador.email, biografia: m.biografia, especialidades: m.especialidades,
      estadoVerificacao: m.estadoVerificacao, totalServicos: m._count.servicos, criadoEm: m.criadoEm,
    })),
    meta: { pagina, limite, total, totalPaginas: Math.max(1, Math.ceil(total / limite)) },
  };
}

export async function verificarMentor(adminId: string, mentorId: string, estado: EstadoVerificacao, ip?: string) {
  const m = await prisma.mentor.findUnique({ where: { id: mentorId } });
  if (!m) throw new AppError(404, "Mentor não encontrado.", "MENTOR_NAO_ENCONTRADO");
  return prisma.$transaction(async (tx) => {
    const r = await tx.mentor.update({ where: { id: mentorId }, data: { estadoVerificacao: estado } });
    await registarAuditoria(tx, { atorUtilizadorId: adminId, acao: "VERIFICAR_MENTOR", tipoEntidade: "Mentor", entidadeId: mentorId, detalhesMinimos: { de: m.estadoVerificacao, para: estado }, enderecoIp: ip });
    return { id: r.id, estadoVerificacao: r.estadoVerificacao };
  });
}

// ---------------- Catálogo público e agendamento pelo candidato ----------------
export async function listarMentoresPublico(filtros?: MentoresPublicoQuery) {
  const where: Prisma.MentorWhereInput = {
    estadoVerificacao: EstadoVerificacao.VERIFICADA,
    ...(filtros?.especialidade && {
      especialidades: { has: filtros.especialidade },
    }),
    ...(filtros?.pesquisa && {
      OR: [
        { utilizador: { nome: { contains: filtros.pesquisa, mode: "insensitive" } } },
        { biografia: { contains: filtros.pesquisa, mode: "insensitive" } },
        { servicos: { some: { titulo: { contains: filtros.pesquisa, mode: "insensitive" } } } },
      ],
    }),
  };

  const mentores = await prisma.mentor.findMany({
    where,
    include: {
      utilizador: { select: { id: true, nome: true, email: true } },
      servicos: {
        where: { tipo: "PERSONALIZADA", ativo: true },
        orderBy: { preco: "asc" },
      },
    },
    orderBy: { criadoEm: "desc" },
  });

  return mentores.map((m) => ({
    id: m.id,
    nome: m.utilizador.nome,
    email: m.utilizador.email,
    biografia: m.biografia,
    especialidades: m.especialidades,
    servicos: m.servicos.map((s) => ({
      id: s.id,
      titulo: s.titulo,
      descricao: s.descricao,
      duracaoMinutos: s.duracaoMinutos,
      preco: s.preco.toString(),
      moeda: s.moeda,
    })),
  }));
}

export async function agendarSessaoCandidato(candidatoId: string, dados: AgendarSessaoInput) {
  const servico = await prisma.servicoMentoria.findUnique({
    where: { id: dados.servicoId },
    include: { mentor: { include: { utilizador: true } } },
  });
  if (!servico || !servico.ativo) {
    throw new AppError(404, "Serviço de mentoria não encontrado ou inativo.", "SERVICO_NAO_ENCONTRADO");
  }
  if (!servico.mentor || servico.mentor.estadoVerificacao !== EstadoVerificacao.VERIFICADA) {
    throw new AppError(400, "Este mentor ainda não está verificado para receber sessões.", "MENTOR_NAO_VERIFICADO");
  }
  if (servico.mentor.utilizadorId === candidatoId) {
    throw new AppError(400, "Não podes agendar uma mentoria contigo próprio.", "AUTO_AGENDAMENTO_INVALIDO");
  }

  const inicio = new Date(dados.inicio);
  if (isNaN(inicio.getTime()) || inicio.getTime() <= Date.now()) {
    throw new AppError(400, "A data da sessão deve ser no futuro.", "DATA_INVALIDA");
  }

  const duracao = servico.duracaoMinutos ?? 60;
  const fim = new Date(inicio.getTime() + duracao * 60 * 1000);

  // Verificar sobreposição na agenda do mentor
  const conflito = await prisma.agendamentoMentoria.findFirst({
    where: {
      mentorId: servico.mentorId!,
      estado: { in: ["CONFIRMADO", "PENDENTE_PAGAMENTO"] },
      inicio: { lt: fim },
      fim: { gt: inicio },
    },
  });
  if (conflito) {
    throw new AppError(409, "O mentor já tem uma sessão agendada neste horário. Escolhe outro horário.", "CONFLITO_HORARIO");
  }

  const agendamento = await prisma.agendamentoMentoria.create({
    data: {
      servicoId: servico.id,
      mentorId: servico.mentorId!,
      candidatoId,
      inicio,
      fim,
      estado: "PENDENTE_PAGAMENTO",
      linkReuniao: null,
    },
    include: {
      servico: { select: { titulo: true, duracaoMinutos: true, preco: true, moeda: true } },
      mentor: { include: { utilizador: { select: { nome: true } } } },
    },
  });

  return {
    id: agendamento.id,
    inicio: agendamento.inicio,
    fim: agendamento.fim,
    estado: agendamento.estado,
    linkReuniao: agendamento.linkReuniao,
    servico: {
      id: servico.id,
      titulo: agendamento.servico.titulo,
      duracaoMinutos: agendamento.servico.duracaoMinutos,
      preco: agendamento.servico.preco.toString(),
      moeda: agendamento.servico.moeda,
    },
    mentor: {
      id: servico.mentor.id,
      nome: agendamento.mentor.utilizador.nome,
    },
  };
}

export async function listarAgendamentosCandidato(candidatoId: string) {
  const itens = await prisma.agendamentoMentoria.findMany({
    where: { candidatoId },
    orderBy: { inicio: "desc" },
    include: {
      servico: { select: { id: true, titulo: true, duracaoMinutos: true, preco: true, moeda: true } },
      mentor: { include: { utilizador: { select: { nome: true, email: true } } } },
    },
  });
  return itens.map((a) => ({
    id: a.id,
    estado: a.estado,
    inicio: a.inicio,
    fim: a.fim,
    linkReuniao: a.linkReuniao,
    motivoCancelamento: a.motivoCancelamento,
    servico: {
      id: a.servico.id,
      titulo: a.servico.titulo,
      duracaoMinutos: a.servico.duracaoMinutos,
      preco: a.servico.preco.toString(),
      moeda: a.servico.moeda,
    },
    mentor: {
      id: a.mentor.id,
      nome: a.mentor.utilizador.nome,
      email: a.mentor.utilizador.email,
      biografia: a.mentor.biografia,
      especialidades: a.mentor.especialidades,
    },
  }));
}

export async function cancelarAgendamentoCandidato(candidatoId: string, id: string, motivo: string) {
  const a = await prisma.agendamentoMentoria.findFirst({
    where: { id, candidatoId },
  });
  if (!a) throw new AppError(404, "Agendamento não encontrado.", "AGENDAMENTO_NAO_ENCONTRADO");
  if (a.estado !== "CONFIRMADO" && a.estado !== "PENDENTE_PAGAMENTO") {
    throw new AppError(409, "Esta sessão já não pode ser cancelada.", "AGENDAMENTO_ESTADO_INVALIDO");
  }
  const atualizado = await prisma.agendamentoMentoria.update({
    where: { id },
    data: { estado: "CANCELADO", motivoCancelamento: motivo },
  });
  return { id: atualizado.id, estado: atualizado.estado };
}

