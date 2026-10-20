import { afterAll, describe, expect, it } from "vitest";
import request from "supertest";
import { app } from "./helpers";
import { prisma } from "../src/config/database";

const email = `auth.${Date.now()}@example.org`;
const palavraPasse = "senhaSegura123";

afterAll(async () => {
  await prisma.utilizador.deleteMany({ where: { email } });
  await prisma.$disconnect();
});

describe("Autenticação", () => {
  it("regista uma conta e inicia sessão automaticamente", async () => {
    const agente = request.agent(app);

    const registo = await agente
      .post("/api/v1/auth/register")
      .send({ nome: "Teste Auth", email, palavraPasse });

    expect(registo.status).toBe(201);
    expect(registo.body.data).toMatchObject({ email, papel: "CANDIDATO" });

    const sessao = await agente.get("/api/v1/auth/me");
    expect(sessao.status).toBe(200);
    expect(sessao.body.data.email).toBe(email);
  });

  it("rejeita um email já registado", async () => {
    const resposta = await request(app)
      .post("/api/v1/auth/register")
      .send({ nome: "Teste Auth", email, palavraPasse });

    expect(resposta.status).toBe(409);
    expect(resposta.body.erro.codigo).toBe("EMAIL_JA_EXISTE");
  });

  it("rejeita credenciais inválidas", async () => {
    const resposta = await request(app)
      .post("/api/v1/auth/login")
      .send({ email, palavraPasse: "palavra-errada" });

    expect(resposta.status).toBe(401);
    expect(resposta.body.erro.codigo).toBe("CREDENCIAIS_INVALIDAS");
  });

  it("exige sessão em /auth/me", async () => {
    const resposta = await request(app).get("/api/v1/auth/me");

    expect(resposta.status).toBe(401);
    expect(resposta.body.erro.codigo).toBe("NAO_AUTENTICADO");
  });

  it("termina a sessão", async () => {
    const agente = request.agent(app);
    await agente
      .post("/api/v1/auth/login")
      .send({ email, palavraPasse });

    const logout = await agente.post("/api/v1/auth/logout");
    expect(logout.status).toBe(200);
    expect(logout.body).toEqual({ ok: true });

    const sessao = await agente.get("/api/v1/auth/me");
    expect(sessao.status).toBe(401);
  });

  it("valida o corpo do pedido", async () => {
    const resposta = await request(app)
      .post("/api/v1/auth/register")
      .send({ nome: "A", email: "invalido", palavraPasse: "123" });

    expect(resposta.status).toBe(400);
    expect(resposta.body.erro.codigo).toBe("VALIDACAO_INVALIDA");
  });
});
