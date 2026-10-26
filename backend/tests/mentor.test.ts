import { afterAll, describe, expect, it } from "vitest";
import request from "supertest";
import { app, iniciarSessao, palavraPasseDemo } from "./helpers";
import { prisma } from "../src/config/database";

const EMAIL_MENTOR = "daniel.demo@example.org";

afterAll(async () => {
  await prisma.$disconnect();
});

// A mentoria ainda não tem rotas: o papel MENTOR só tem de conseguir entrar
// e navegar no catálogo, sem aceder a nada de candidato nem de administração.
describe("Utilizador com papel MENTOR", () => {
  it("consegue iniciar sessão e /auth/me devolve o papel", async () => {
    const mentor = await iniciarSessao(EMAIL_MENTOR, palavraPasseDemo());
    const eu = await mentor.get("/api/v1/auth/me");

    expect(eu.status).toBe(200);
    expect(eu.body.data.papel).toBe("MENTOR");
  });

  it("lê o catálogo público", async () => {
    const mentor = await iniciarSessao(EMAIL_MENTOR, palavraPasseDemo());
    const catalogo = await mentor.get("/api/v1/oportunidades");
    expect(catalogo.status).toBe(200);
  });

  it("não acede ao perfil de candidato nem à administração (403)", async () => {
    const mentor = await iniciarSessao(EMAIL_MENTOR, palavraPasseDemo());

    const perfil = await mentor.get("/api/v1/perfis/me");
    expect(perfil.status).toBe(403);
    expect(perfil.body.erro.codigo).toBe("SEM_PERMISSAO");

    const admin = await mentor.get("/api/v1/admin/metricas");
    expect(admin.status).toBe(403);
    expect(admin.body.erro.codigo).toBe("SEM_PERMISSAO");
  });

  it("sem sessão, /auth/me responde 401 sem corpo de erro sensível", async () => {
    const resposta = await request(app).get("/api/v1/auth/me");
    expect(resposta.status).toBe(401);
    expect(resposta.body.erro.codigo).toBe("NAO_AUTENTICADO");
  });
});

describe("Interação Estudante - Mentor", () => {
  const EMAIL_CANDIDATO = "ana.demo@example.org";

  it("lista mentores verificados com serviços ativos publicamente", async () => {
    const resposta = await request(app).get("/api/v1/mentores");
    expect(resposta.status).toBe(200);
    expect(Array.isArray(resposta.body.data)).toBe(true);
    expect(resposta.body.data.length).toBeGreaterThan(0);
    const m = resposta.body.data[0];
    expect(m).toHaveProperty("nome");
    expect(m).toHaveProperty("biografia");
    expect(m).toHaveProperty("servicos");
    expect(m.servicos.length).toBeGreaterThan(0);
  });

  it("estudante solicita sessão e mentor decide aceitar ou recusar", async () => {
    const lista = await request(app).get("/api/v1/mentores");
    const mentorAlvo = lista.body.data.find((m: { email: string }) => m.email === EMAIL_MENTOR) || lista.body.data[0];
    const servico = mentorAlvo.servicos[0];

    const candidato = await iniciarSessao(EMAIL_CANDIDATO, palavraPasseDemo());
    const mentor = await iniciarSessao(mentorAlvo.email, palavraPasseDemo());
    const dataFutura = new Date(Date.now() + 15 * 864e5).toISOString(); // 15 dias no futuro

    // 1. Candidato envia solicitação
    const solicitacao = await candidato
      .post("/api/v1/candidato/mentorias/agendar")
      .send({ servicoId: servico.id, inicio: dataFutura });

    expect(solicitacao.status).toBe(201);
    expect(solicitacao.body.data).toHaveProperty("id");
    expect(solicitacao.body.data.estado).toBe("PENDENTE_PAGAMENTO");

    const sessaoId = solicitacao.body.data.id;

    // 2. Mentor consulta as solicitações na sua agenda
    const agenda = await mentor.get("/api/v1/mentor/agenda");
    expect(agenda.status).toBe(200);
    const pendente = agenda.body.data.find((s: { id: string }) => s.id === sessaoId);
    expect(pendente).toBeDefined();
    expect(pendente.estado).toBe("PENDENTE_PAGAMENTO");

    // 3. Mentor aceita a solicitação
    const aceite = await mentor.post(`/api/v1/mentor/agenda/${sessaoId}/aceitar`);
    expect(aceite.status).toBe(200);
    expect(aceite.body.data.estado).toBe("CONFIRMADO");
    expect(aceite.body.data.linkReuniao).toContain("meet.jit.si");

    // 4. Candidato vê a mentoria confirmada com o link de reunião
    const minhas = await candidato.get("/api/v1/candidato/mentorias");
    expect(minhas.status).toBe(200);
    const mentoriaConfirmada = minhas.body.data.find((s: { id: string }) => s.id === sessaoId);
    expect(mentoriaConfirmada).toBeDefined();
    expect(mentoriaConfirmada.estado).toBe("CONFIRMADO");
    expect(mentoriaConfirmada.linkReuniao).toContain("meet.jit.si");

    // 5. Testar recusa numa nova solicitação
    const dataFutura2 = new Date(Date.now() + 16 * 864e5).toISOString();
    const solicitacao2 = await candidato
      .post("/api/v1/candidato/mentorias/agendar")
      .send({ servicoId: servico.id, inicio: dataFutura2 });
    expect(solicitacao2.status).toBe(201);

    const recusa = await mentor
      .post(`/api/v1/mentor/agenda/${solicitacao2.body.data.id}/recusar`)
      .send({ motivo: "Indisponibilidade de agenda neste dia." });
    expect(recusa.status).toBe(200);
    expect(recusa.body.data.estado).toBe("CANCELADO");
  });
});

