import "dotenv/config";
import { execSync } from "node:child_process";
import { PrismaClient } from "@prisma/client";

const SCHEMA_TESTE = "bolsa360_test";

export default async function () {
  const base = process.env.DATABASE_URL;

  if (!base) {
    throw new Error(
      "DATABASE_URL em falta. Configura o backend/.env antes de correr os testes.",
    );
  }

  const urlTeste = new URL(base);
  urlTeste.searchParams.set("schema", SCHEMA_TESTE);

  const clienteAdmin = new PrismaClient({ datasourceUrl: base });
  await clienteAdmin.$executeRawUnsafe(
    `DROP SCHEMA IF EXISTS "${SCHEMA_TESTE}" CASCADE`,
  );
  await clienteAdmin.$disconnect();

  const env = { ...process.env, DATABASE_URL: urlTeste.toString() };
  const cwd = process.cwd();

  execSync("npx prisma migrate deploy", { cwd, env, stdio: "inherit" });
  execSync("npx tsx prisma/seed.ts", { cwd, env, stdio: "inherit" });
}
