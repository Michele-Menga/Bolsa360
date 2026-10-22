import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import {
  app,
  EMAIL_ADMIN,
  iniciarSessao,
  palavraPasseAdmin,
} from "./helpers";
import { prisma } from "../src/config/database";

const email = `perfil.${Date.now()}@example.org`;
const palavraPasse = "senhaSegura123";

let agente: ReturnType<typeof request.agent>;

beforeAll(async () => {
  agente = request.agent(app);
  const registo = await agente
    .post("/api/v1/auth/register")
    .send({ nome: "Perfil Teste", email, palavraPasse });

  expect(registo.status).toBe(201);
});

afterAll(async () => {
  await prisma.utilizador.deleteMany({ where: { email } });
  await prisma.$disconnect();
});

describe("Perfil do candidato", () => {
  it("devolve 404 enquanto o perfil não existe", async () => {
    const resposta = await agente.get("/api/v1/perfis/me");

    expect(resposta.status).toBe(404);
    expect(resposta.body.erro.codigo).toBe("PERFIL_NAO_ENCONTRADO");
  });

  it("cria o perfil no primeiro PUT (upsert)", async () => {
    const resposta = await agente.put("/api/v1/perfis/me").send({
      nacionalidadeCodigo: "AO",
      dataNascimento: "2002-04-15",
      areaEstudo: "Engenharia Informatica",
      instituicaoEnsino: "ISPTEC",
      paisDestinoPreferido: "PT",
      idiomas: { pt: "Nativo", en: "B1" },
    });

    expect(resposta.status).toBe(200);
    expect(resposta.body.data).toMatchObject({
      nacionalidadeCodigo: "AO",
      areaEstudo: "Engenharia Informatica",
      instituicaoEnsino: "ISPTEC",
      idiomas: { pt: "Nativo", en: "B1" },
    });

    const consulta = await agente.get("/api/v1/perfis/me");
    expect(consulta.status).toBe(200);
    expect(consulta.body.data.areaEstudo).toBe("Engenharia Informatica");
  });

  it("atualiza o perfil existente", async () => {
    const resposta = await agente.put("/api/v1/perfis/me").send({
      nacionalidadeCodigo: "AO",
      areaEstudo: "Engenharia de Software",
    });

    expect(resposta.status).toBe(200);
    expect(resposta.body.data.areaEstudo).toBe("Engenharia de Software");
  });

  it("rejeita um payload inválido", async () => {
    const resposta = await agente
      .put("/api/v1/perfis/me")
      .send({ nacionalidadeCodigo: "A" });

    expect(resposta.status).toBe(400);
    expect(resposta.body.erro.codigo).toBe("VALIDACAO_INVALIDA");
  });

  it("exige autenticação", async () => {
    const resposta = await request(app).get("/api/v1/perfis/me");

    expect(resposta.status).toBe(401);
  });

  it("bloqueia utilizadores que não são candidatos", async () => {
    const administrador = await iniciarSessao(
      EMAIL_ADMIN,
      palavraPasseAdmin(),
    );

    const resposta = await administrador.get("/api/v1/perfis/me");
    expect(resposta.status).toBe(403);
    expect(resposta.body.erro.codigo).toBe("SEM_PERMISSAO");
  });
});
