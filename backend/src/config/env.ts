import "dotenv/config";

function obterPorta(valor: string | undefined): number {
  if (valor === undefined) {
    return 3000;
  }

  const porta = Number(valor);
  if (!Number.isInteger(porta) || porta < 1 || porta > 65535) {
    throw new Error("PORT deve ser um número inteiro entre 1 e 65535.");
  }

  return porta;
}

function obterSegredo(valor: string | undefined): string {
  if (!valor || valor.length < 32) {
    throw new Error(
      "SESSION_SECRET em falta ou curto. Define pelo menos 32 caracteres no backend/.env " +
        "(usa o backend/.env.example como modelo).",
    );
  }

  return valor;
}

export const env = {
  PORT: obterPorta(process.env.PORT),
  NODE_ENV: process.env.NODE_ENV ?? "development",
  SESSION_SECRET: obterSegredo(process.env.SESSION_SECRET),
  FRONTEND_URL: process.env.FRONTEND_URL ?? "http://localhost:5173",
};
