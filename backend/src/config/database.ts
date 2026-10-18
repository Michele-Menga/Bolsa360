import { PrismaClient } from "@prisma/client";

// A aplicacao partilha uma unica ligacao Prisma durante a execucao do servidor.
export const prisma = new PrismaClient();
