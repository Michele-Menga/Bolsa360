import { afterAll, describe, expect, it } from "vitest";
import request from "supertest";
import { app, OPORTUNIDADE_1, OPORTUNIDADE_6 } from "./helpers";
import { prisma } from "../src/config/database";

const ESTADOS_PRAZO = ["FUTURO", "ABERTO", "EXPIRADO", "SEM_PRAZO_CONFIRMADO"];

afterAll(async () => {
  await prisma.$disconnect();
});

describe("Catálogo público de oportunidades", () => {
  it("lista apenas oportunidades publicadas, com meta", async () => {
    const publicadas = await prisma.oportunidade.count({
      where: { estadoEditorial: "PUBLICADA" },
    });

    const resposta = await request(app).get("/api/v1/oportunidades");

    expect(resposta.status).toBe(200);
    expect(resposta.body.meta.total).toBe(publicadas);
    expect(resposta.body.data).toHaveLength(Math.min(publicadas, 10));
    expect(resposta.body.meta).toMatchObject({
      pagina: 1,
      limite: 10,
      totalPaginas: Math.ceil(publicadas / 10),
    });

    for (const oportunidade of resposta.body.data) {
      expect(ESTADOS_PRAZO).toContain(oportunidade.estadoPrazo);
      expect(
        oportunidade.valorFinanciamento === null ||
          typeof oportunidade.valorFinanciamento === "string",
      ).toBe(true);
    }
  });

  it("filtra por estado do prazo", async () => {
    const resposta = await request(app)
      .get("/api/v1/oportunidades")
      .query({ estadoPrazo: "ABERTO" });

    expect(resposta.status).toBe(200);
    for (const oportunidade of resposta.body.data) {
      expect(oportunidade.estadoPrazo).toBe("ABERTO");
    }
  });

  it("rejeita paginação inválida", async () => {
    const resposta = await request(app)
      .get("/api/v1/oportunidades")
      .query({ pagina: 0 });

    expect(resposta.status).toBe(400);
    expect(resposta.body.erro.codigo).toBe("VALIDACAO_INVALIDA");
  });

  it("devolve o detalhe de uma oportunidade publicada", async () => {
    const resposta = await request(app).get(
      `/api/v1/oportunidades/${OPORTUNIDADE_1}`,
    );

    expect(resposta.status).toBe(200);
    expect(resposta.body.data.id).toBe(OPORTUNIDADE_1);
    expect(Array.isArray(resposta.body.data.regras)).toBe(true);
    expect(Array.isArray(resposta.body.data.documentosExigidos)).toBe(true);
  });

  it("não expõe oportunidades não publicadas", async () => {
    const resposta = await request(app).get(
      `/api/v1/oportunidades/${OPORTUNIDADE_6}`,
    );

    expect(resposta.status).toBe(404);
    expect(resposta.body.erro.codigo).toBe("NAO_ENCONTRADA");
  });

  it("rejeita um identificador inválido", async () => {
    const resposta = await request(app).get(
      "/api/v1/oportunidades/nao-e-um-uuid",
    );

    expect(resposta.status).toBe(400);
    expect(resposta.body.erro.codigo).toBe("VALIDACAO_INVALIDA");
  });
});
