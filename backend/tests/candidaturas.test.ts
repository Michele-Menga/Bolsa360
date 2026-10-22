import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import {
  app,
  CANDIDATURA_BRUNO,
  EMAIL_ANA,
  OPORTUNIDADE_1,
  OPORTUNIDADE_2,
  UTILIZADOR_ANA,
  iniciarSessao,
  palavraPasseDemo,
} from "./helpers";
import { prisma } from "../src/config/database";

let agente: ReturnType<typeof request.agent>;
let candidaturaId: string | undefined;

beforeAll(async () => {
  agente = await iniciarSessao(EMAIL_ANA, palavraPasseDemo());
});

afterAll(async () => {
  await prisma.candidatura.deleteMany({
    where: { utilizadorId: UTILIZADOR_ANA, oportunidadeId: OPORTUNIDADE_2 },
  });
  await prisma.$disconnect();
});

describe("Candidaturas", () => {
  it("lista as candidaturas do utilizador autenticado", async () => {
    const resposta = await agente.get("/api/v1/candidaturas");

    expect(resposta.status).toBe(200);
    expect(Array.isArray(resposta.body.data)).toBe(true);
    for (const candidatura of resposta.body.data) {
      expect(candidatura.oportunidade).toBeTruthy();
    }
  });

  it("recusa uma candidatura ativa duplicada", async () => {
    const resposta = await agente
      .post("/api/v1/candidaturas")
      .send({ oportunidadeId: OPORTUNIDADE_1 });

    expect(resposta.status).toBe(409);
    expect(resposta.body.erro.codigo).toBe("CANDIDATURA_DUPLICADA");
  });

  it("cria uma candidatura e regista o histórico inicial", async () => {
    const resposta = await agente
      .post("/api/v1/candidaturas")
      .send({ oportunidadeId: OPORTUNIDADE_2 });

    expect(resposta.status).toBe(201);
    expect(resposta.body.data.estado).toBe("PLANEADA");
    candidaturaId = resposta.body.data.id;

    const detalhe = await agente.get(
      `/api/v1/candidaturas/${candidaturaId}`,
    );

    expect(detalhe.status).toBe(200);
    expect(detalhe.body.data.historico).toHaveLength(1);
    expect(detalhe.body.data.historico[0]).toMatchObject({
      estadoAnterior: null,
      estadoNovo: "PLANEADA",
    });
  });

  it("recusa duplicar a candidatura acabada de criar", async () => {
    const resposta = await agente
      .post("/api/v1/candidaturas")
      .send({ oportunidadeId: OPORTUNIDADE_2 });

    expect(resposta.status).toBe(409);
  });

  it("atualiza o estado e acrescenta ao histórico", async () => {
    const resposta = await agente
      .patch(`/api/v1/candidaturas/${candidaturaId}`)
      .send({ estado: "EM_PREPARACAO", notasPrivadas: "A reunir documentos." });

    expect(resposta.status).toBe(200);
    expect(resposta.body.data.estado).toBe("EM_PREPARACAO");
    expect(resposta.body.data.notasPrivadas).toBe("A reunir documentos.");

    const detalhe = await agente.get(
      `/api/v1/candidaturas/${candidaturaId}`,
    );
    expect(detalhe.body.data.historico).toHaveLength(2);
    expect(detalhe.body.data.historico[1]).toMatchObject({
      estadoAnterior: "PLANEADA",
      estadoNovo: "EM_PREPARACAO",
    });
  });

  it("preenche dataSubmissaoExterna ao submeter externamente", async () => {
    const resposta = await agente
      .patch(`/api/v1/candidaturas/${candidaturaId}`)
      .send({ estado: "SUBMETIDA_EXTERNAMENTE" });

    expect(resposta.status).toBe(200);
    expect(resposta.body.data.estado).toBe("SUBMETIDA_EXTERNAMENTE");
    expect(resposta.body.data.dataSubmissaoExterna).toBeTruthy();
  });

  it("não deixa aceder a candidaturas de outro utilizador", async () => {
    const resposta = await agente
      .patch(`/api/v1/candidaturas/${CANDIDATURA_BRUNO}`)
      .send({ estado: "EM_PREPARACAO" });

    expect(resposta.status).toBe(404);
    expect(resposta.body.erro.codigo).toBe("NAO_ENCONTRADA");
  });

  it("rejeita um estado inválido", async () => {
    const resposta = await agente
      .patch(`/api/v1/candidaturas/${candidaturaId}`)
      .send({ estado: "ESTADO_INVALIDO" });

    expect(resposta.status).toBe(400);
    expect(resposta.body.erro.codigo).toBe("VALIDACAO_INVALIDA");
  });

  it("exige autenticação", async () => {
    const resposta = await request(app).get("/api/v1/candidaturas");

    expect(resposta.status).toBe(401);
  });
});
