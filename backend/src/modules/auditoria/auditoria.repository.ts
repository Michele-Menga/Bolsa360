import { Prisma, PrismaClient } from '@prisma/client';

// Aceita o cliente normal ou um cliente de transação, para poder ser chamado
// dentro de prisma.$transaction (RN-08). O serviço decide se a auditoria faz
// parte da mesma transação da operação administrativa.
export type ClientePrisma = PrismaClient | Prisma.TransactionClient;

export type DadosAuditoria = {
  atorUtilizadorId?: string | null; // pode faltar em eventos do sistema
  acao: string; // ex.: PUBLICAR_OPORTUNIDADE
  tipoEntidade: string; // ex.: Oportunidade
  entidadeId?: string | null;
  detalhesMinimos?: Prisma.InputJsonValue; // sem segredos nem dados excessivos
  enderecoIp?: string | null;
};

export async function registarAuditoria(cliente: ClientePrisma, dados: DadosAuditoria) {
  return cliente.registoAuditoria.create({
    data: {
      atorUtilizadorId: dados.atorUtilizadorId ?? null,
      acao: dados.acao,
      tipoEntidade: dados.tipoEntidade,
      entidadeId: dados.entidadeId ?? null,
      detalhesMinimos: dados.detalhesMinimos,
      enderecoIp: dados.enderecoIp ?? null,
    },
  });
}
