import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { listarOportunidadesPublicas } from '../src/modules/oportunidades/oportunidades.repository';

const prisma = new PrismaClient();

async function main() {
  const r = await listarOportunidadesPublicas(prisma, { estadoPrazo: 'ABERTO' });
  console.log(JSON.stringify(r, null, 2));
}

main().finally(() => prisma.$disconnect());