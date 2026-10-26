// Pré-visualização: parte "mentor" da API simulada.
const D = (h: number) => new Date(Date.now() + h * 36e5).toISOString();
type Ctx = { me: any; users: any; E: (s: number, c: string, m: string) => any[] };
const mentores: any[] = [
  { id: "m1", userId: "u2", biografia: "Mestre em Engenharia pela Universidade do Porto, ajudo estudantes angolanos a conseguirem bolsas na Europa.", especialidades: ["Bolsas em Portugal", "Cartas de motivação"], estado: "VERIFICADA" },
  { id: "m2", userId: "u3", biografia: "", especialidades: [], estado: "PENDENTE" },
];
let servicos: any[] = [
  { id: "s1", mentorId: "m1", titulo: "Revisão da carta de motivação", descricao: "Revisão detalhada com feedback escrito e sessão de 45 minutos.", duracaoMinutos: 45, preco: "15000.00", moeda: "AOA", ativo: true, criadoEm: D(-200), atualizadoEm: D(-200) },
  { id: "s2", mentorId: "m1", titulo: "Preparação de entrevista de bolsa", descricao: "Simulação de entrevista com perguntas reais e plano de melhoria.", duracaoMinutos: 60, preco: "25000.00", moeda: "AOA", ativo: false, criadoEm: D(-100), atualizadoEm: D(-100) },
];
let agenda: any[] = [
  { id: "a1", mentorId: "m1", servicoId: "s1", cand: "Ana Domingos", estado: "CONFIRMADO", inicio: D(26), fim: D(26.75), linkReuniao: "https://meet.example.org/demo-abc", motivoCancelamento: null },
  { id: "a2", mentorId: "m1", servicoId: "s2", cand: "Bruno Neto", estado: "CONFIRMADO", inicio: D(-0.5), fim: D(0.5), linkReuniao: null, motivoCancelamento: null },
  { id: "a3", mentorId: "m1", servicoId: "s1", cand: "Carla Pinto", estado: "PENDENTE_PAGAMENTO", inicio: D(50), fim: D(50.75), linkReuniao: null, motivoCancelamento: null },
  { id: "a4", mentorId: "m1", servicoId: "s1", cand: "Ana Domingos", estado: "CONCLUIDO", inicio: D(-120), fim: D(-119), linkReuniao: "https://meet.example.org/demo-old", motivoCancelamento: null },
];
export const MENTORES_DEMO = { "daniel.demo@example.org": { id: "u2", nome: "Daniel Costa (demo)", email: "daniel.demo@example.org", papel: "MENTOR" }, "filipe.demo@example.org": { id: "u3", nome: "Filipe Gomes (demo)", email: "filipe.demo@example.org", papel: "MENTOR" } };
export const criarMentor = (userId: string, biografia = "", especialidades: string[] = []) => mentores.push({ id: "m" + userId, userId, biografia, especialidades, estado: "PENDENTE" });

const serM = (m: any) => ({ id: m.id, biografia: m.biografia, especialidades: m.especialidades, estadoVerificacao: m.estado, perfilCompleto: m.biografia.trim().length >= 20 && m.especialidades.length > 0, criadoEm: D(-500) });
const serS = (s: any, m: any) => ({ ...s, visivelParaCandidatos: s.ativo && m.estado === "VERIFICADA" });
let seq = 100;

export function rotaMentor(met: string, path: string, q: URLSearchParams, b: any, { me, users, E }: Ctx): any[] | null {
  if (path.startsWith("/admin/mentores")) {
    if (!me) return E(401, "NAO_AUTENTICADO", "Sessão não encontrada."); if (me.papel !== "ADMIN") return E(403, "SEM_PERMISSAO", "Sem permissão.");
    const r = path.match(/^\/admin\/mentores\/([\w-]+)\/verificacao$/);
    if (r) { const m = mentores.find((x) => x.id === r[1]); if (!m) return E(404, "MENTOR_NAO_ENCONTRADO", "Mentor não encontrado."); m.estado = b.estado; return [200, { data: { id: m.id, estadoVerificacao: m.estado } }]; }
    const est = q.get("estado"); const a = mentores.filter((m) => !est || m.estado === est); const p = +(q.get("pagina") ?? 1), l = +(q.get("limite") ?? 10);
    const user = (m: any) => Object.values(users).find((u: any) => u.id === m.userId) as any;
    return [200, { data: a.slice((p - 1) * l, p * l).map((m) => ({ id: m.id, nome: user(m)?.nome ?? "—", email: user(m)?.email ?? "—", biografia: m.biografia, especialidades: m.especialidades, estadoVerificacao: m.estado, totalServicos: servicos.filter((s) => s.mentorId === m.id).length, criadoEm: D(-500) })), meta: { pagina: p, limite: l, total: a.length, totalPaginas: Math.max(1, Math.ceil(a.length / l)) } }];
  }
  if (path === "/mentores") {
    const esp = q.get("especialidade");
    const pesq = q.get("pesquisa")?.toLowerCase();
    const user = (m: any) => Object.values(users).find((u: any) => u.id === m.userId) as any;
    const lista = mentores.filter((m) => m.estado === "VERIFICADA" && (!esp || m.especialidades.includes(esp))).map((m) => {
      const u = user(m);
      return {
        id: m.id,
        nome: u?.nome ?? "Daniel Costa",
        email: u?.email ?? "daniel.demo@example.org",
        biografia: m.biografia || "Mentor especializado com experiência comprovada.",
        especialidades: m.especialidades,
        servicos: servicos.filter((s) => s.mentorId === m.id && s.ativo).map((s) => ({
          id: s.id, titulo: s.titulo, descricao: s.descricao, duracaoMinutos: s.duracaoMinutos, preco: s.preco, moeda: s.moeda
        })),
      };
    }).filter((m) => !pesq || m.nome.toLowerCase().includes(pesq) || m.biografia.toLowerCase().includes(pesq));
    return [200, { data: lista }];
  }
  if (path.startsWith("/candidato/mentorias")) {
    if (!me) return E(401, "NAO_AUTENTICADO", "Sessão não encontrada.");
    if (path === "/candidato/mentorias/agendar" && met === "POST") {
      const s = servicos.find((x) => x.id === b.servicoId);
      if (!s) return E(404, "SERVICO_NAO_ENCONTRADO", "Serviço não encontrado.");
      const m = mentores.find((x) => x.id === s.mentorId);
      const user = Object.values(users).find((u: any) => u.id === m?.userId) as any;
      const novo = {
        id: "a" + ++seq,
        mentorId: s.mentorId,
        servicoId: s.id,
        cand: me.nome,
        candidatoId: me.id,
        estado: "PENDENTE_PAGAMENTO",
        inicio: b.inicio,
        fim: new Date(+new Date(b.inicio) + (s.duracaoMinutos ?? 60) * 60000).toISOString(),
        linkReuniao: null,
        motivoCancelamento: null,
      };
      agenda.unshift(novo);
      return [201, { data: { id: novo.id, estado: novo.estado, inicio: novo.inicio, fim: novo.fim, linkReuniao: novo.linkReuniao, servico: s, mentor: { id: m?.id, nome: user?.nome ?? "Mentor" } } }];
    }
    if (path === "/candidato/mentorias" && met === "GET") {
      const user = (mId: string) => { const m = mentores.find((x) => x.id === mId); return Object.values(users).find((u: any) => u.id === m?.userId) as any; };
      const mBio = (mId: string) => mentores.find((x) => x.id === mId);
      return [200, { data: agenda.map((a) => {
        const s = servicos.find((x) => x.id === a.servicoId);
        const u = user(a.mentorId);
        const m = mBio(a.mentorId);
        return {
          id: a.id, estado: a.estado, inicio: a.inicio, fim: a.fim, linkReuniao: a.linkReuniao, motivoCancelamento: a.motivoCancelamento,
          servico: { id: s?.id, titulo: s?.titulo, duracaoMinutos: s?.duracaoMinutos, preco: s?.preco, moeda: s?.moeda },
          mentor: { id: a.mentorId, nome: u?.nome ?? "Daniel Costa", email: u?.email ?? "", biografia: m?.biografia ?? "", especialidades: m?.especialidades ?? [] },
        };
      }) }];
    }
    let r = path.match(/^\/candidato\/mentorias\/([\w-]+)\/cancelar$/);
    if (r) {
      const a = agenda.find((x) => x.id === r![1]);
      if (a) { a.estado = "CANCELADO"; a.motivoCancelamento = b.motivo; return [200, { data: { id: a.id, estado: a.estado } }]; }
    }
  }
  if (!path.startsWith("/mentor/")) return null;
  if (!me) return E(401, "NAO_AUTENTICADO", "Sessão não encontrada."); if (me.papel !== "MENTOR") return E(403, "SEM_PERMISSAO", "Sem permissão.");
  const m = mentores.find((x) => x.userId === me.id) ?? (mentores.push({ id: "m" + me.id, userId: me.id, biografia: "", especialidades: [], estado: "PENDENTE" }), mentores[mentores.length - 1]);
  if (path === "/mentor/me") { if (met === "PUT") Object.assign(m, { ...(b.biografia !== undefined && { biografia: b.biografia }), ...(b.especialidades && { especialidades: b.especialidades }) }); return [200, { data: serM(m) }]; }
  if (path === "/mentor/servicos") {
    if (met === "GET") return [200, { data: servicos.filter((s) => s.mentorId === m.id).map((s) => serS(s, m)) }];
    const s = { id: "s" + ++seq, mentorId: m.id, ...b, preco: Number(b.preco).toFixed(2), ativo: true, criadoEm: D(0), atualizadoEm: D(0) }; servicos.unshift(s); return [201, { data: serS(s, m) }];
  }
  let r = path.match(/^\/mentor\/servicos\/([\w-]+)$/);
  if (r) { const s = servicos.find((x) => x.id === r![1] && x.mentorId === m.id); if (!s) return E(404, "SERVICO_NAO_ENCONTRADO", "Serviço não encontrado."); Object.assign(s, b, b.preco ? { preco: Number(b.preco).toFixed(2) } : {}); return [200, { data: serS(s, m) }]; }
  if (path === "/mentor/agenda") {
    const est = q.get("estado");
    return [200, { data: agenda.filter((a) => a.mentorId === m.id && (!est || a.estado === est)).sort((x, y) => +new Date(x.inicio) - +new Date(y.inicio)).map((a) => {
      const s = servicos.find((x) => x.id === a.servicoId);
      return { id: a.id, estado: a.estado, inicio: a.inicio, fim: a.fim, expiraEm: null, servico: { titulo: s.titulo, duracaoMinutos: s.duracaoMinutos }, candidato: { nome: a.cand },
        linkReuniao: ["CONFIRMADO", "CONCLUIDO"].includes(a.estado) ? a.linkReuniao : null, aguardaLink: a.estado === "CONFIRMADO" && !a.linkReuniao, motivoCancelamento: a.motivoCancelamento };
    }) }];
  }
  r = path.match(/^\/mentor\/agenda\/([\w-]+)\/(aceitar|recusar|concluir|cancelar)$/);
  if (r) {
    const a = agenda.find((x) => x.id === r![1] && x.mentorId === m.id); if (!a) return E(404, "AGENDAMENTO_NAO_ENCONTRADO", "Sessão não encontrada.");
    if (r[2] === "aceitar") {
      if (a.estado !== "PENDENTE_PAGAMENTO") return E(409, "AGENDAMENTO_ESTADO_INVALIDO", "Apenas solicitações pendentes podem ser aceites.");
      a.estado = "CONFIRMADO";
      a.linkReuniao = a.linkReuniao || `https://meet.jit.si/bolsa360-preview-${a.id}`;
      return [200, { data: { id: a.id, estado: a.estado, linkReuniao: a.linkReuniao } }];
    }
    if (r[2] === "recusar") {
      if (a.estado !== "PENDENTE_PAGAMENTO") return E(409, "AGENDAMENTO_ESTADO_INVALIDO", "Apenas solicitações pendentes podem ser recusadas.");
      a.estado = "CANCELADO";
      a.motivoCancelamento = b?.motivo || "Solicitação não aceite pelo mentor.";
      return [200, { data: { id: a.id, estado: a.estado, motivoCancelamento: a.motivoCancelamento } }];
    }
    if (r[2] === "concluir") {
      if (a.estado !== "CONFIRMADO") return E(409, "AGENDAMENTO_ESTADO_INVALIDO", "Só é possível concluir sessões confirmadas.");
      if (new Date(a.inicio) > new Date()) return E(409, "SESSAO_AINDA_NAO_COMECOU", "A sessão ainda não começou.");
      a.estado = "CONCLUIDO"; return [200, { data: { id: a.id, estado: a.estado } }];
    }
    if (!["CONFIRMADO", "PENDENTE_PAGAMENTO"].includes(a.estado)) return E(409, "AGENDAMENTO_ESTADO_INVALIDO", "Esta sessão já não pode ser cancelada.");
    const pago = a.estado === "CONFIRMADO"; a.estado = "CANCELADO"; a.motivoCancelamento = b.motivo; return [200, { data: { id: a.id, estado: a.estado, reembolsoManual: pago } }];
  }
  return E(404, "NAO_ENCONTRADA", "Rota não encontrada.");
}
