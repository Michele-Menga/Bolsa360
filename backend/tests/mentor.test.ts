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
