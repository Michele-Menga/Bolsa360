import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import {
  app,
  EMAIL_ADMIN,
  EMAIL_ANA,
  OPORTUNIDADE_1,
  TIPO_BOLSA_UNIVERSITARIA,
  UTILIZADOR_ADMIN,
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
    await prisma.registoAuditoria.deleteMany({ where: { entidadeId: criadaId } });
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

    const metricas = await candidato.get("/api/v1/admin/metricas");
    expect(metricas.status).toBe(403);
    expect(metricas.body.erro.codigo).toBe("SEM_PERMISSAO");
  });

  it("devolve as métricas do painel administrativo", async () => {
    const [utilizadores, oportunidades, pendencias, candidaturas] =
      await Promise.all([
        prisma.utilizador.count(),
        prisma.oportunidade.count(),
        prisma.oportunidade.count({ where: { estadoEditorial: "PENDENTE" } }),
        prisma.candidatura.count(),
      ]);

    const resposta = await administrador.get("/api/v1/admin/metricas");

    expect(resposta.status).toBe(200);
    expect(resposta.body.data).toEqual({
      utilizadores,
      oportunidades,
      pendencias,
      candidaturas,
    });
  });

  it("cria oportunidades sempre em RASCUNHO e registra auditoria", async () => {
    const resposta = await administrador
      .post("/api/v1/admin/oportunidades")
      .send(payload);

    expect(resposta.status).toBe(201);
    expect(resposta.body.data.estadoEditorial).toBe("RASCUNHO");
    expect(resposta.body.data.titulo).toBe(payload.titulo);

    criadaId = resposta.body.data.id;
    const id = criadaId as string;

    const registo = await prisma.registoAuditoria.findFirst({
      where: { entidadeId: id, acao: "CRIAR_OPORTUNIDADE" },
    });

    expect(registo).not.toBeNull();
    expect(registo?.atorUtilizadorId).toBe(UTILIZADOR_ADMIN);
    expect(registo?.tipoEntidade).toBe("Oportunidade");
    expect(registo?.enderecoIp).toBeTruthy();
  });

  it("atualiza e registra auditoria", async () => {
    const id = criadaId as string;

    const resposta = await administrador
      .patch(`/api/v1/admin/oportunidades/${id}`)
      .send({ entidadeFinanciadora: "Entidade Atualizada" });

    expect(resposta.status).toBe(200);
    expect(resposta.body.data.entidadeFinanciadora).toBe("Entidade Atualizada");

    const registo = await prisma.registoAuditoria.findFirst({
      where: { entidadeId: id, acao: "ATUALIZAR_OPORTUNIDADE" },
    });

    expect(registo?.atorUtilizadorId).toBe(UTILIZADOR_ADMIN);
    expect(registo?.detalhesMinimos).toEqual({
      campos: ["entidadeFinanciadora"],
    });
  });

  it("publica, registra auditoria e aparece no catálogo público", async () => {
    const id = criadaId as string;

    const publicar = await administrador.post(
      `/api/v1/admin/oportunidades/${id}/publicar`,
    );

    expect(publicar.status).toBe(200);
    expect(publicar.body.data.estadoEditorial).toBe("PUBLICADA");

    const registo = await prisma.registoAuditoria.findFirst({
      where: { entidadeId: id, acao: "PUBLICAR_OPORTUNIDADE" },
    });

    expect(registo?.atorUtilizadorId).toBe(UTILIZADOR_ADMIN);
    expect(registo?.detalhesMinimos).toEqual({
      estadoAnterior: "RASCUNHO",
      estadoNovo: "PUBLICADA",
    });

    const detalhe = await request(app).get(`/api/v1/oportunidades/${id}`);
    expect(detalhe.status).toBe(200);
    expect(detalhe.body.data.id).toBe(id);

    const lista = await request(app)
      .get("/api/v1/oportunidades")
      .query({ q: payload.titulo });
    expect(lista.status).toBe(200);
    expect(
      lista.body.data.some(
        (oportunidade: { id: string }) => oportunidade.id === id,
      ),
    ).toBe(true);
  });

  it("arquiva, registra auditoria e retira do catálogo público", async () => {
    const id = criadaId as string;

    const resposta = await administrador.post(
      `/api/v1/admin/oportunidades/${id}/arquivar`,
    );

    expect(resposta.status).toBe(200);
    expect(resposta.body.data.estadoEditorial).toBe("ARQUIVADA");

    const registo = await prisma.registoAuditoria.findFirst({
      where: { entidadeId: id, acao: "ARQUIVAR_OPORTUNIDADE" },
    });

    expect(registo?.atorUtilizadorId).toBe(UTILIZADOR_ADMIN);

    const detalhe = await request(app).get(`/api/v1/oportunidades/${id}`);
    expect(detalhe.status).toBe(404);
  });
});
