import { afterAll, describe, expect, it } from "vitest";
import request from "supertest";
import { app } from "./helpers";
import { prisma } from "../src/config/database";

const palavraPasse = "senhaSegura123";
const criados: string[] = [];

async function criarConta(prefixo: string, email: string): Promise<string> {
  const resposta = await request(app)
    .post("/api/v1/auth/register")
    .send({ nome: `Conta ${prefixo}`, email, palavraPasse });

  expect(resposta.status).toBe(201);
  criados.push(resposta.body.data.id);
  return resposta.body.data.id as string;
}

async function prepararConta(
  prefixo: string,
  estado: "SUSPENSO" | "DESATIVADO",
): Promise<{ id: string; email: string }> {
  const email = `rn14.${prefixo}.${Date.now()}@example.org`;
  const id = await criarConta(prefixo, email);
  await prisma.utilizador.update({ where: { id }, data: { estado } });
  return { id, email };
}

afterAll(async () => {
  await prisma.utilizador.deleteMany({ where: { id: { in: criados } } });
  await prisma.$disconnect();
});

describe("RN-14: contas não ativas", () => {
  it("impede o login de uma conta suspensa", async () => {
    const { email } = await prepararConta("suspenso", "SUSPENSO");

    const resposta = await request(app)
      .post("/api/v1/auth/login")
      .send({ email, palavraPasse });

    expect(resposta.status).toBe(403);
    expect(resposta.body.erro.codigo).toBe("CONTA_NAO_ATIVA");
    expect(resposta.headers["set-cookie"]).toBeUndefined();
  });

  it("impede o login de uma conta desativada", async () => {
    const { email } = await prepararConta("desativado", "DESATIVADO");

    const resposta = await request(app)
      .post("/api/v1/auth/login")
      .send({ email, palavraPasse });

    expect(resposta.status).toBe(403);
    expect(resposta.body.erro.codigo).toBe("CONTA_NAO_ATIVA");
    expect(resposta.headers["set-cookie"]).toBeUndefined();
  });

  it("invalida uma sessão aberta quando a conta é suspensa", async () => {
    const email = `rn14.sessao.${Date.now()}@example.org`;
    const id = await criarConta("sessao", email);
    const agente = request.agent(app);

    const login = await agente
      .post("/api/v1/auth/login")
      .send({ email, palavraPasse });
    expect(login.status).toBe(200);

    const antes = await agente.get("/api/v1/auth/me");
    expect(antes.status).toBe(200);

    await prisma.utilizador.update({
      where: { id },
      data: { estado: "SUSPENSO" },
    });

    const depois = await agente.get("/api/v1/auth/me");
    expect(depois.status).toBe(403);
    expect(depois.body.erro.codigo).toBe("CONTA_NAO_ATIVA");
  });
});
