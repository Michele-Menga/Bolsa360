import request from "supertest";
import app from "../src/app";

export { app };

export const EMAIL_ADMIN = "admin@example.org";
export const EMAIL_ANA = "ana.demo@example.org";

export const UTILIZADOR_ANA = "00000000-0000-4000-8000-000000000011";

export const OPORTUNIDADE_1 = "00000000-0000-4000-8000-000000000401";
export const OPORTUNIDADE_2 = "00000000-0000-4000-8000-000000000402";
export const OPORTUNIDADE_6 = "00000000-0000-4000-8000-000000000406";

export const TIPO_BOLSA_UNIVERSITARIA = "00000000-0000-4000-8000-000000000101";

export const CANDIDATURA_BRUNO = "00000000-0000-4000-8000-000000001302";

function lerEnv(nome: string): string {
  const valor = process.env[nome];
  if (!valor) {
    throw new Error(
      `${nome} em falta. Configura o backend/.env antes de correr os testes.`,
    );
  }
  return valor;
}

export function palavraPasseDemo(): string {
  return lerEnv("SEED_DEMO_PASSWORD");
}

export function palavraPasseAdmin(): string {
  return lerEnv("SEED_ADMIN_PASSWORD");
}

export async function iniciarSessao(email: string, palavraPasse: string) {
  const agente = request.agent(app);
  const resposta = await agente
    .post("/api/v1/auth/login")
    .send({ email, palavraPasse });

  if (resposta.status !== 200) {
    throw new Error(
      `Login falhou para ${email}: ${resposta.status} ${JSON.stringify(resposta.body)}`,
    );
  }

  return agente;
}
