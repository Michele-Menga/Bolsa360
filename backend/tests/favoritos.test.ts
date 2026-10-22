import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import {
  app,
  EMAIL_ANA,
  OPORTUNIDADE_2,
  OPORTUNIDADE_6,
  UTILIZADOR_ANA,
  iniciarSessao,
  palavraPasseDemo,
} from "./helpers";
import { prisma } from "../src/config/database";

let agente: ReturnType<typeof request.agent>;
let totalInicial: number;

beforeAll(async () => {
  agente = await iniciarSessao(EMAIL_ANA, palavraPasseDemo());
  const resposta = await agente.get("/api/v1/favoritos");
  totalInicial = resposta.body.data.length;
});

afterAll(async () => {
  await prisma.favorito.deleteMany({
    where: { utilizadorId: UTILIZADOR_ANA, oportunidadeId: OPORTUNIDADE_2 },
  });
  await prisma.$disconnect();
});

describe("Favoritos", () => {
  it("lista os favoritos do utilizador autenticado", async () => {
    const resposta = await agente.get("/api/v1/favoritos");

    expect(resposta.status).toBe(200);
    expect(Array.isArray(resposta.body.data)).toBe(true);
    expect(resposta.body.data).toHaveLength(totalInicial);
  });

  it("adiciona um favorito de forma idempotente", async () => {
    const primeiro = await agente.post(`/api/v1/favoritos/${OPORTUNIDADE_2}`);
    expect(primeiro.status).toBe(201);
    expect(primeiro.body).toEqual({ ok: true });

    const segundo = await agente.post(`/api/v1/favoritos/${OPORTUNIDADE_2}`);
    expect(segundo.status).toBe(201);

    const lista = await agente.get("/api/v1/favoritos");
    expect(lista.body.data).toHaveLength(totalInicial + 1);
    expect(
      lista.body.data.some((item: { id: string }) => item.id === OPORTUNIDADE_2),
    ).toBe(true);
  });

  it("remove um favorito", async () => {
    const resposta = await agente.delete(
      `/api/v1/favoritos/${OPORTUNIDADE_2}`,
    );
    expect(resposta.status).toBe(200);
    expect(resposta.body).toEqual({ ok: true });

    const lista = await agente.get("/api/v1/favoritos");
    expect(lista.body.data).toHaveLength(totalInicial);
  });

  it("recusa favoritar uma oportunidade não publicada", async () => {
    const resposta = await agente.post(
      `/api/v1/favoritos/${OPORTUNIDADE_6}`,
    );

    expect(resposta.status).toBe(404);
    expect(resposta.body.erro.codigo).toBe("NAO_ENCONTRADA");
  });

  it("exige autenticação", async () => {
    const resposta = await request(app).get("/api/v1/favoritos");

    expect(resposta.status).toBe(401);
  });
});
