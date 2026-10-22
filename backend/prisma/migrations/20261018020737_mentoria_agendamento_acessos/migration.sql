/*
  Warnings:

  - Added the required column `mentor_id` to the `agendamentos_mentoria` table without a default value. This is not possible if the table is not empty.
  - Added the required column `servico_id` to the `pagamentos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `utilizador_id` to the `pagamentos` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "EstadoAcesso" AS ENUM ('ATIVO', 'REVOGADO');

-- CreateEnum
CREATE TYPE "PapelMensagem" AS ENUM ('UTILIZADOR', 'ASSISTENTE');

-- DropIndex
DROP INDEX "agendamentos_mentoria_servico_id_inicio_idx";

-- AlterTable
ALTER TABLE "agendamentos_mentoria" ADD COLUMN     "expira_em" TIMESTAMPTZ,
ADD COLUMN     "mentor_id" UUID NOT NULL,
ADD COLUMN     "motivo_cancelamento" TEXT;

-- AlterTable
ALTER TABLE "pagamentos" ADD COLUMN     "servico_id" UUID NOT NULL,
ADD COLUMN     "utilizador_id" UUID NOT NULL,
ALTER COLUMN "agendamento_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "servicos_mentoria" ADD COLUMN     "validade_dias" INTEGER,
ALTER COLUMN "duracao_minutos" DROP NOT NULL;

-- CreateTable
CREATE TABLE "eventos_pagamento" (
    "id" UUID NOT NULL,
    "fornecedor" VARCHAR(50) NOT NULL,
    "evento_externo_id" VARCHAR(150) NOT NULL,
    "tipo" VARCHAR(80) NOT NULL,
    "pagamento_id" UUID,
    "payload" JSONB NOT NULL,
    "recebido_em" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processado_em" TIMESTAMPTZ,

    CONSTRAINT "eventos_pagamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "acessos_servico" (
    "id" UUID NOT NULL,
    "utilizador_id" UUID NOT NULL,
    "servico_id" UUID NOT NULL,
    "pagamento_id" UUID NOT NULL,
    "estado" "EstadoAcesso" NOT NULL DEFAULT 'ATIVO',
    "inicio_em" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expira_em" TIMESTAMPTZ,

    CONSTRAINT "acessos_servico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversas_ia" (
    "id" UUID NOT NULL,
    "utilizador_id" UUID NOT NULL,
    "acesso_id" UUID NOT NULL,
    "titulo" VARCHAR(200),
    "criado_em" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "conversas_ia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mensagens_ia" (
    "id" UUID NOT NULL,
    "conversa_id" UUID NOT NULL,
    "papel" "PapelMensagem" NOT NULL,
    "conteudo" TEXT NOT NULL,
    "criado_em" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mensagens_ia_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "eventos_pagamento_pagamento_id_idx" ON "eventos_pagamento"("pagamento_id");

-- CreateIndex
CREATE UNIQUE INDEX "eventos_pagamento_fornecedor_evento_externo_id_key" ON "eventos_pagamento"("fornecedor", "evento_externo_id");

-- CreateIndex
CREATE UNIQUE INDEX "acessos_servico_pagamento_id_key" ON "acessos_servico"("pagamento_id");

-- CreateIndex
CREATE INDEX "acessos_servico_utilizador_id_servico_id_estado_idx" ON "acessos_servico"("utilizador_id", "servico_id", "estado");

-- CreateIndex
CREATE INDEX "conversas_ia_utilizador_id_atualizado_em_idx" ON "conversas_ia"("utilizador_id", "atualizado_em");

-- CreateIndex
CREATE INDEX "mensagens_ia_conversa_id_criado_em_idx" ON "mensagens_ia"("conversa_id", "criado_em");

-- CreateIndex
CREATE INDEX "agendamentos_mentoria_mentor_id_inicio_idx" ON "agendamentos_mentoria"("mentor_id", "inicio");

-- CreateIndex
CREATE INDEX "agendamentos_mentoria_estado_expira_em_idx" ON "agendamentos_mentoria"("estado", "expira_em");

-- CreateIndex
CREATE INDEX "pagamentos_utilizador_id_idx" ON "pagamentos"("utilizador_id");

-- AddForeignKey
ALTER TABLE "agendamentos_mentoria" ADD CONSTRAINT "agendamentos_mentoria_mentor_id_fkey" FOREIGN KEY ("mentor_id") REFERENCES "mentores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagamentos" ADD CONSTRAINT "pagamentos_utilizador_id_fkey" FOREIGN KEY ("utilizador_id") REFERENCES "utilizadores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagamentos" ADD CONSTRAINT "pagamentos_servico_id_fkey" FOREIGN KEY ("servico_id") REFERENCES "servicos_mentoria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eventos_pagamento" ADD CONSTRAINT "eventos_pagamento_pagamento_id_fkey" FOREIGN KEY ("pagamento_id") REFERENCES "pagamentos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "acessos_servico" ADD CONSTRAINT "acessos_servico_utilizador_id_fkey" FOREIGN KEY ("utilizador_id") REFERENCES "utilizadores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "acessos_servico" ADD CONSTRAINT "acessos_servico_servico_id_fkey" FOREIGN KEY ("servico_id") REFERENCES "servicos_mentoria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "acessos_servico" ADD CONSTRAINT "acessos_servico_pagamento_id_fkey" FOREIGN KEY ("pagamento_id") REFERENCES "pagamentos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversas_ia" ADD CONSTRAINT "conversas_ia_utilizador_id_fkey" FOREIGN KEY ("utilizador_id") REFERENCES "utilizadores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversas_ia" ADD CONSTRAINT "conversas_ia_acesso_id_fkey" FOREIGN KEY ("acesso_id") REFERENCES "acessos_servico"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mensagens_ia" ADD CONSTRAINT "mensagens_ia_conversa_id_fkey" FOREIGN KEY ("conversa_id") REFERENCES "conversas_ia"("id") ON DELETE CASCADE ON UPDATE CASCADE;
