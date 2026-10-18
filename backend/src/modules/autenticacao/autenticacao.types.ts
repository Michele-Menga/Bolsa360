import { Papel } from "@prisma/client";

export type UtilizadorAutenticado = {
  id: string;
  nome: string;
  email: string;
  papel: Papel;
};
