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

export const env = {
  PORT: obterPorta(process.env.PORT),
  NODE_ENV: process.env.NODE_ENV ?? "development",
};
