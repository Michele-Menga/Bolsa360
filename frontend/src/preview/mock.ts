// Pré-visualização: simula a API do backend em memória (só usado com VITE_PREVIEW).
// Dados de referência simulados (o backend real devolve-os em GET /referencias, com os IDs do seed).
const ID = (n: string) => `00000000-0000-4000-8000-000000000${n}`;
const REF = {
  tipos: [
    ["BOLSA_UNIVERSITARIA", "Bolsa universitária", "101"], ["BOLSA_ENSINO_MEDIO", "Bolsa para ensino médio", "102"], ["BOLSA_LINGUA", "Bolsa de língua", "103"],
    ["BOLSA_TECNICA", "Bolsa técnica/profissional", "104"], ["CURSO_CURTO", "Curso curto/formação financiada", "105"], ["INTERCAMBIO", "Intercâmbio académico", "106"],
    ["INVESTIGACAO", "Investigação/fellowship", "107"], ["MERITO", "Bolsa de mérito", "108"], ["NECESSIDADE_FINANCEIRA", "Bolsa por necessidade financeira", "109"],
    ["ESTAGIO", "Bolsa de estágio/aprendizagem", "10a"], ["PROGRAMA_JUVENIL", "Programa juvenil ou de liderança", "10b"], ["OUTRA", "Outra oportunidade financiada", "10c"],
  ].map(([codigo, nome, n]) => ({ id: ID(n), codigo, nome, descricao: "" })),
  niveis: [
    ["ENSINO_MEDIO", "Ensino Médio", "201"], ["CURSO_TECNICO", "Curso Técnico", "206"], ["LICENCIATURA", "Licenciatura", "202"],
    ["POS_GRADUACAO", "Pós-Graduação", "205"], ["MESTRADO", "Mestrado", "203"], ["DOUTORAMENTO", "Doutoramento", "204"],
  ].map(([codigo, nome, n], i) => ({ id: ID(n), codigo, nome, ordem: i + 1 })),
  categorias: [{ id: ID("304"), nome: "Tecnologia", slug: "tecnologia" }],
};
const D = (n: number) => new Date(Date.now() + n * 864e5).toISOString();
// Colunas DATE (abertura/prazo): o backend devolve meia-noite UTC.
const DD = (n: number) => D(n).slice(0, 10) + "T00:00:00.000Z";
const T = (c: string) => { const t = REF.tipos.find((x) => x.codigo === c)!; return { codigo: t.codigo, nome: t.nome, descricao: "" }; };
const N = (c: string) => { const n = REF.niveis.find((x) => x.codigo === c)!; return { codigo: n.codigo, nome: n.nome }; };
const desc = "Programa de apoio a estudantes angolanos com mérito académico. Cobre propinas e custos de instalação e inclui acompanhamento durante o curso. Dado fictício de demonstração.";
const base = { descricao: desc, categorias: [{ nome: "Tecnologia", slug: "tecnologia" }], moeda: "EUR", modalidade: "PRESENCIAL", cicloAno: "2026/27", urlFonteOficial: "https://example.org/bolsa", urlCandidatura: null, ultimaVerificacaoEm: D(-3),
  regras: [{ tipoRegra: "IDADE", operador: "MENOR_IGUAL", valorTexto: null, valorNumerico: "30", valorMinimo: null, valorMaximo: null, obrigatoriedade: "OBRIGATORIA", estadoConfirmacao: "CONFIRMADA", textoFonte: null, urlFonte: null },
    { tipoRegra: "MEDIA_MINIMA", operador: "MAIOR_IGUAL", valorTexto: null, valorNumerico: "14", valorMinimo: null, valorMaximo: null, obrigatoriedade: "OBRIGATORIA", estadoConfirmacao: "POR_CONFIRMAR", textoFonte: null, urlFonte: null }],
  documentosExigidos: [{ nome: "Certificado de Notas", descricao: "Histórico académico.", obrigatorio: true, estadoConfirmacao: "CONFIRMADA" }, { nome: "Carta de Motivação", descricao: "Até 2 páginas.", obrigatorio: true, estadoConfirmacao: "CONFIRMADA" }] };
const mk = (id: string, titulo: string, ent: string, tipo: string, nivel: string, pais: string, fin: string, valor: string | null, ab: number | null, pr: number | null, el: string, estadoEditorial = "PUBLICADA") =>
  ({ ...base, id, titulo, entidadeFinanciadora: ent, tipo: T(tipo), nivelEnsino: N(nivel), paisDestinoCodigo: pais, tipoFinanciamento: fin, valorFinanciamento: valor,
    dataAbertura: ab === null ? null : DD(ab), prazoCandidatura: pr === null ? null : DD(pr), elegibilidadeAngolanos: el, estadoEditorial, atualizadoEm: D(-1), elegibilidadePaises: [{ codigoPais: "AO", tipoCriterio: "NACIONALIDADE", resultado: el, observacoes: null }] }) as any;
let ops: any[] = [
  mk("op1", "Bolsa Luso-Angolana de Excelência 2026", "Fundação Luso-Angolana", "BOLSA_UNIVERSITARIA", "MESTRADO", "PT", "INTEGRAL", "12000", -20, 9, "ELEGIVEL"),
  mk("op2", "Programa de Mobilidade Engenharia & Tecnologia", "Universidade do Porto", "INTERCAMBIO", "LICENCIATURA", "PT", "PARCIAL", "4500", -10, 25, "POR_CONFIRMAR"),
  mk("op3", "Bolsa Governo da China — Mestrado", "Conselho de Bolsas da China", "BOLSA_UNIVERSITARIA", "MESTRADO", "CN", "INTEGRAL", "18000", -30, 60, "ELEGIVEL"),
  mk("op4", "Curso Online de Data Science (financiado)", "Instituto Digital África", "CURSO_CURTO", "CURSO_TECNICO", "AO", "CURSO_GRATUITO", null, 20, 80, "ELEGIVEL"),
  mk("op5", "Fellowship de Investigação em Energias Renováveis", "Centro Brasil-África", "INVESTIGACAO", "DOUTORAMENTO", "BR", "ESTIPENDIO", "9600", -60, -10, "NAO_ELEGIVEL"),
  mk("op6", "Bolsa de Línguas — Francês B2", "Aliança Francesa", "BOLSA_LINGUA", "ENSINO_MEDIO", "FR", "PROPINA", "1200", null, null, "POR_CONFIRMAR"),
  mk("op7", "Estágio Remunerado em Engenharia de Software", "TechBridge Angola", "ESTAGIO", "LICENCIATURA", "AO", "ESTIPENDIO", "3000", 0, 40, "ELEGIVEL", "RASCUNHO"),
];
const hojeUTC = () => { const n = new Date(); return new Date(Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate())); };
const prazo = (o: any) => !o.prazoCandidatura ? "SEM_PRAZO_CONFIRMADO" : new Date(o.prazoCandidatura) < hojeUTC() ? "EXPIRADO" : o.dataAbertura && new Date(o.dataAbertura) > hojeUTC() ? "FUTURO" : "ABERTO";
const pub = (o: any) => ({ ...o, estadoPrazo: prazo(o) });
const users: any = { "admin@example.org": { id: "u0", nome: "Administrador Bolsa360 (demo)", email: "admin@example.org", papel: "ADMIN" },
  "ana.demo@example.org": { id: "u1", nome: "Ana Domingos (demo)", email: "ana.demo@example.org", papel: "CANDIDATO" },
  "daniel.demo@example.org": { id: "u2", nome: "Daniel Sousa (demo)", email: "daniel.demo@example.org", papel: "MENTOR" } };
let me: any = null, favs: string[] = ["op3"], perfil: any = null, cands: any[] = [], seq = 10;
const hist = (de: string | null, para: string, obs: string | null = null) => ({ estadoAnterior: de, estadoNovo: para, alteradoEm: new Date().toISOString(), observacao: obs });
const resumoC = (c: any) => { const o = ops.find((x) => x.id === c.oportunidadeId); return { id: c.id, estado: c.estado, notasPrivadas: c.notas, dataSubmissaoExterna: c.sub, criadoEm: c.criadoEm, atualizadoEm: c.atualizadoEm,
  oportunidade: { id: o.id, titulo: o.titulo, entidadeFinanciadora: o.entidadeFinanciadora, estadoEditorial: o.estadoEditorial, valorFinanciamento: o.valorFinanciamento, moeda: o.moeda, prazoCandidatura: o.prazoCandidatura, estadoPrazo: prazo(o) } }; };
cands = [{ id: "c1", oportunidadeId: "op1", estado: "EM_PREPARACAO", notas: "Pedir carta de recomendação.", sub: null, criadoEm: D(-5), atualizadoEm: D(-2), historico: [hist(null, "PLANEADA"), hist("PLANEADA", "EM_PREPARACAO", "Documentos em recolha")] }];
const E = (s: number, codigo: string, mensagem: string) => [s, { erro: { codigo, mensagem } }];
const pagina = (arr: any[], q: URLSearchParams, def = 10) => { const p = +(q.get("pagina") ?? 1), l = +(q.get("limite") ?? def); return { data: arr.slice((p - 1) * l, p * l), meta: { pagina: p, limite: l, total: arr.length, totalPaginas: Math.ceil(arr.length / l) } }; };

function rota(m: string, path: string, q: URLSearchParams, b: any): any[] {
  const auth = (papel?: string) => (!me ? E(401, "NAO_AUTENTICADO", "Sessão não encontrada.") : papel && me.papel !== papel ? E(403, "SEM_PERMISSAO", "Sem permissão.") : null);
  let r: RegExpMatchArray | null;
  if (m === "POST" && path === "/auth/login") { const u = users[String(b.email).toLowerCase()]; if (!u) return E(401, "CREDENCIAIS_INVALIDAS", "Email ou palavra-passe incorretos."); me = u; return [200, { data: u }]; }
  if (m === "POST" && path === "/auth/register") { if (users[b.email]) return E(409, "EMAIL_JA_EXISTE", "Este email já está registado."); me = users[b.email] = { id: "u" + ++seq, nome: b.nome, email: b.email, papel: "CANDIDATO" }; return [201, { data: me }]; }
  if (m === "POST" && path === "/auth/logout") { me = null; return [200, { ok: true }]; }
  if (path === "/auth/me") return auth() ?? [200, { data: me }];
  if (m === "GET" && path === "/referencias") return [200, { data: REF }];
  if (m === "GET" && path === "/oportunidades") {
    let a = ops.filter((o) => o.estadoEditorial === "PUBLICADA").map(pub); const g = (k: string) => q.get(k);
    if (g("q")) a = a.filter((o) => (o.titulo + o.entidadeFinanciadora).toLowerCase().includes(g("q")!.toLowerCase()));
    if (g("tipo")) a = a.filter((o) => o.tipo.codigo === g("tipo")); if (g("nivel")) a = a.filter((o) => o.nivelEnsino.codigo === g("nivel"));
    if (g("paisDestino")) a = a.filter((o) => o.paisDestinoCodigo === g("paisDestino")); if (g("financiamento")) a = a.filter((o) => o.tipoFinanciamento === g("financiamento"));
    if (g("elegibilidadeAngolanos")) a = a.filter((o) => o.elegibilidadeAngolanos === g("elegibilidadeAngolanos")); if (g("estadoPrazo")) a = a.filter((o) => o.estadoPrazo === g("estadoPrazo"));
    a.sort((x, y) => g("ordenar") === "recentes" ? +new Date(y.atualizadoEm) - +new Date(x.atualizadoEm) : +new Date(x.prazoCandidatura ?? 9e15) - +new Date(y.prazoCandidatura ?? 9e15));
    return [200, pagina(a, q)];
  }
  if (m === "GET" && (r = path.match(/^\/oportunidades\/([\w-]+)$/))) { const o = ops.find((x) => x.id === r![1] && x.estadoEditorial === "PUBLICADA"); return o ? [200, { data: pub(o) }] : E(404, "NAO_ENCONTRADA", "Oportunidade não encontrada."); }
  if (path.startsWith("/favoritos")) { const e = auth(); if (e) return e; r = path.match(/^\/favoritos\/([\w-]+)$/);
    if (m === "GET") return [200, { data: favs.map((id) => ops.find((o) => o.id === id)).filter(Boolean).map((o) => ({ ...pub(o), favoritadoEm: D(-1) })) }];
    if (m === "POST") { if (!favs.includes(r![1])) favs.push(r![1]); return [201, { ok: true }]; } favs = favs.filter((x) => x !== r![1]); return [200, { ok: true }]; }
  if (path.startsWith("/candidaturas")) { const e = auth(); if (e) return e; r = path.match(/^\/candidaturas\/([\w-]+)$/);
    if (m === "GET" && !r) return [200, { data: cands.map(resumoC) }];
    if (m === "GET") { const c = cands.find((x) => x.id === r![1]); return c ? [200, { data: { ...resumoC(c), historico: c.historico } }] : E(404, "NAO_ENCONTRADA", "Candidatura não encontrada."); }
    if (m === "POST") { const o = ops.find((x) => x.id === b.oportunidadeId && x.estadoEditorial === "PUBLICADA"); if (!o) return E(404, "NAO_ENCONTRADA", "Oportunidade não encontrada.");
      if (cands.some((c) => c.oportunidadeId === o.id && !["CANCELADA", "REJEITADA"].includes(c.estado))) return E(409, "CANDIDATURA_DUPLICADA", "Já existe uma candidatura ativa.");
      const c = { id: "c" + ++seq, oportunidadeId: o.id, estado: "PLANEADA", notas: null, sub: null, criadoEm: D(0), atualizadoEm: D(0), historico: [hist(null, "PLANEADA")] }; cands.unshift(c); return [201, { data: resumoC(c) }]; }
    const c = cands.find((x) => x.id === r![1]); if (!c) return E(404, "NAO_ENCONTRADA", "Candidatura não encontrada.");
    if (b.estado !== c.estado) { c.historico.push(hist(c.estado, b.estado, b.observacao)); if (b.estado === "SUBMETIDA_EXTERNAMENTE" && !c.sub) c.sub = D(0); c.estado = b.estado; }
    if (b.notasPrivadas !== undefined) c.notas = b.notasPrivadas; c.atualizadoEm = D(0); return [200, { data: resumoC(c) }]; }
  if (path === "/perfis/me") { const e = auth("CANDIDATO"); if (e) return e; if (m === "GET") return perfil ? [200, { data: perfil }] : E(404, "PERFIL_NAO_ENCONTRADO", "Perfil não encontrado.");
    perfil = { utilizadorId: me.id, dataNascimento: null, nivelEnsinoAtualId: null, areaEstudo: null, instituicaoEnsino: null, paisDestinoPreferido: null, idiomas: null, ...b }; return [200, { data: perfil }]; }
  if (path.startsWith("/admin")) { const e = auth("ADMIN"); if (e) return e;
    if (path === "/admin/metricas") return [200, { data: { utilizadores: Object.keys(users).length + 5, oportunidades: ops.length, pendencias: ops.filter((o) => ["RASCUNHO", "PENDENTE"].includes(o.estadoEditorial)).length, candidaturas: cands.length } }];
    if (m === "GET" && path === "/admin/oportunidades") { let a = ops; if (q.get("estadoEditorial")) a = a.filter((o) => o.estadoEditorial === q.get("estadoEditorial"));
      if (q.get("pesquisa")) a = a.filter((o) => (o.titulo + o.entidadeFinanciadora).toLowerCase().includes(q.get("pesquisa")!.toLowerCase())); return [200, pagina(a, q)]; }
    if (m === "POST" && path === "/admin/oportunidades") { const t = REF.tipos.find((x) => x.id === b.tipoOportunidadeId); const n = REF.niveis.find((x) => x.id === b.nivelEnsinoId);
      const o = { ...base, ...b, id: "op" + ++seq, tipo: T(t?.codigo ?? "OUTRA"), nivelEnsino: n ? N(n.codigo) : null, estadoEditorial: "RASCUNHO", paisDestinoCodigo: b.paisDestinoCodigo ?? null, dataAbertura: b.dataAbertura ?? null, prazoCandidatura: b.prazoCandidatura ?? null,
        valorFinanciamento: b.valorFinanciamento ?? null, elegibilidadeAngolanos: "POR_CONFIRMAR", atualizadoEm: D(0) }; ops.unshift(o); return [201, { data: o }]; }
    r = path.match(/^\/admin\/oportunidades\/([\w-]+)(?:\/(publicar|arquivar))?$/); const o = ops.find((x) => x.id === r?.[1]); if (!o) return E(404, "NAO_ENCONTRADA", "Oportunidade não encontrada.");
    if (r![2]) { o.estadoEditorial = r![2] === "publicar" ? "PUBLICADA" : "ARQUIVADA"; o.atualizadoEm = D(0); return [200, { data: o }]; }
    if (m === "PATCH") { const { tipoOportunidadeId, nivelEnsinoId, ...resto } = b; Object.assign(o, resto);
      if (tipoOportunidadeId) o.tipo = T(REF.tipos.find((x) => x.id === tipoOportunidadeId)!.codigo);
      if (nivelEnsinoId) o.nivelEnsino = N(REF.niveis.find((x) => x.id === nivelEnsinoId)!.codigo); o.atualizadoEm = D(0); }
    // GET devolve o registo completo (com os IDs de tipo e nível), como o backend real; PATCH devolve o resumo.
    if (m === "GET") return [200, { data: { ...o, tipoOportunidadeId: REF.tipos.find((x) => x.codigo === o.tipo.codigo)?.id, nivelEnsinoId: o.nivelEnsino ? REF.niveis.find((x) => x.codigo === o.nivelEnsino.codigo)?.id ?? null : null } }];
    return [200, { data: o }]; }
  return E(404, "NAO_ENCONTRADA", "Rota não encontrada.");
}

export function instalarMock() {
  const real = window.fetch.bind(window);
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = new URL(typeof input === "string" ? input : input instanceof URL ? input.href : input.url, location.href);
    if (!url.pathname.startsWith("/api/v1")) return real(input, init);
    await new Promise((r) => setTimeout(r, 450 + Math.random() * 350)); // latência simulada, para se verem os carregamentos
    const [status, corpo] = rota((init?.method ?? "GET").toUpperCase(), url.pathname.slice(7), url.searchParams, init?.body ? JSON.parse(String(init.body)) : {});
    return new Response(JSON.stringify(corpo), { status, headers: { "Content-Type": "application/json" } });
  };
}
