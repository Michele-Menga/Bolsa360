import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import {
  app,
  EMAIL_ADMIN,
  EMAIL_ANA,
  OPORTUNIDADE_1,
  TIPO_BOLSA_UNIVERSITARIA,
  iniciarSessao,
  palavraPasseAdmin,
  palavraPasseDemo,
} from "./helpers";
import { prisma } from "../src/config/database";

let administrador: ReturnType<typeof request.agent>;
let candidato: ReturnType<typeof request.agent>;
let criadaId: string | undefined;

const payload = {
  titulo: `[TESTE] Oportunidade admin ${Date.now()}`,
  entidadeFinanciadora: "Entidade de Teste",
  tipoOportunidadeId: TIPO_BOLSA_UNIVERSITARIA,
  descricao: "Descricao de teste com mais de dez caracteres.",
  tipoFinanciamento: "INTEGRAL",
  urlFonteOficial: "https://example.org/teste",
};

beforeAll(async () => {
  administrador = await iniciarSessao(EMAIL_ADMIN, palavraPasseAdmin());
  candidato = await iniciarSessao(EMAIL_ANA, palavraPasseDemo());
});

afterAll(async () => {
  if (criadaId) {
    await prisma.oportunidade.deleteMany({ where: { id: criadaId } });
  }
  await prisma.$disconnect();
});

describe("Administração de oportunidades", () => {
  it("exige sessão numa rota admin", async () => {
    const resposta = await request(app).get("/api/v1/admin/oportunidades");

    expect(resposta.status).toBe(401);
    expect(resposta.body.erro.codigo).toBe("NAO_AUTENTICADO");
  });

  it("proíbe um candidato de aceder a rotas admin", async () => {
    const listar = await candidato.get("/api/v1/admin/oportunidades");
    expect(listar.status).toBe(403);
    expect(listar.body.erro.codigo).toBe("SEM_PERMISSAO");

    const publicar = await candidato.post(
      `/api/v1/admin/oportunidades/${OPORTUNIDADE_1}/publicar`,
    );
    expect(publicar.status).toBe(403);
    expect(publicar.body.erro.codigo).toBe("SEM_PERMISSAO");
  });

  it("cria oportunidades sempre em RASCUNHO", async () => {
    const resposta = await administrador
      .post("/api/v1/admin/oportunidades")
      .send(payload);

    expect(resposta.status).toBe(201);
    expect(resposta.body.data.estadoEditorial).toBe("RASCUNHO");
    expect(resposta.body.data.titulo).toBe(payload.titulo);

    criadaId = resposta.body.data.id;
  });

  it("publica e a oportunidade passa a aparecer no catálogo público", async () => {
    const publicar = await administrador.post(
      `/api/v1/admin/oportunidades/${criadaId}/publicar`,
    );

    expect(publicar.status).toBe(200);
    expect(publicar.body.data.estadoEditorial).toBe("PUBLICADA");

    const detalhe = await request(app).get(
      `/api/v1/oportunidades/${criadaId}`,
    );
    expect(detalhe.status).toBe(200);
    expect(detalhe.body.data.id).toBe(criadaId);

    const lista = await request(app)
      .get("/api/v1/oportunidades")
      .query({ q: payload.titulo });
    expect(lista.status).toBe(200);
    expect(
      lista.body.data.some(
        (oportunidade: { id: string }) => oportunidade.id === criadaId,
      ),
    ).toBe(true);
  });
});
