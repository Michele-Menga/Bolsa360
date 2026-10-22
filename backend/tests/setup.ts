import "dotenv/config";

const base = process.env.DATABASE_URL;

if (!base) {
  throw new Error(
    "DATABASE_URL em falta. Configura o backend/.env antes de correr os testes.",
  );
}

const url = new URL(base);
url.searchParams.set("schema", "bolsa360_test");

process.env.DATABASE_URL = url.toString();
process.env.NODE_ENV = "test";

if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32) {
  process.env.SESSION_SECRET = "segredo-de-testes-com-mais-de-32-caracteres";
}
