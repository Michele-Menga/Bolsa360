import { afterAll, describe, expect, it } from "vitest";
import request from "supertest";
import { app } from "./helpers";
import { prisma } from "../src/config/database";

afterAll(async () => {
  await prisma.$disconnect();
});

describe("GET /api/v1/referencias", () => {
  it("é público e devolve tipos, níveis e categorias com IDs", async () => {
    const resposta = await request(app).get("/api/v1/referencias");

    expect(resposta.status).toBe(200);
    const { tipos, niveis, categorias } = resposta.body.data;

    expect(tipos.length).toBeGreaterThan(0);
    expect(niveis.length).toBeGreaterThan(0);
    expect(categorias.length).toBeGreaterThan(0);

    expect(tipos[0]).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        codigo: expect.any(String),
        nome: expect.any(String),
      }),
    );
    expect(niveis[0]).toEqual(
      expect.objectContaining({ id: expect.any(String), codigo: expect.any(String), ordem: expect.any(Number) }),
    );
    expect(categorias[0]).toEqual(
      expect.objectContaining({ id: expect.any(String), slug: expect.any(String) }),
    );
  });

  it("os níveis vêm ordenados pela ordem pedagógica", async () => {
    const resposta = await request(app).get("/api/v1/referencias");
    const ordens = resposta.body.data.niveis.map((n: { ordem: number }) => n.ordem);
    expect(ordens).toEqual([...ordens].sort((a: number, b: number) => a - b));
  });

  it("os IDs devolvidos são aceites pela API de administração (ligação real tipo/nível)", async () => {
    const { tipos } = (await request(app).get("/api/v1/referencias")).body.data;
    const existe = await prisma.tipoOportunidade.findUnique({ where: { id: tipos[0].id } });
    expect(existe?.codigo).toBe(tipos[0].codigo);
  });

  it("não expõe campos internos nem exige sessão (sem Set-Cookie)", async () => {
    const resposta = await request(app).get("/api/v1/referencias");
    expect(resposta.headers["set-cookie"]).toBeUndefined();
    expect(resposta.body.data.tipos[0]).not.toHaveProperty("ativo");
    expect(resposta.body.data.niveis[0]).not.toHaveProperty("ativo");
  });
});
