-- CreateEnum
CREATE TYPE "TipoServicoMentoria" AS ENUM ('GERAL', 'PERSONALIZADA');

-- CreateEnum
CREATE TYPE "EstadoAgendamento" AS ENUM ('PENDENTE_PAGAMENTO', 'CONFIRMADO', 'CONCLUIDO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "EstadoPagamento" AS ENUM ('PENDENTE', 'CONFIRMADO', 'FALHADO', 'REEMBOLSADO');

-- AlterEnum
ALTER TYPE "Papel" ADD VALUE 'MENTOR';

-- CreateTable
CREATE TABLE "mentores" (
    "id" UUID NOT NULL,
    "utilizador_id" UUID NOT NULL,
    "biografia" TEXT NOT NULL,
    "especialidades" TEXT[],
    "estado_verificacao" "EstadoVerificacao" NOT NULL DEFAULT 'PENDENTE',
    "criado_em" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "mentores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "servicos_mentoria" (
    "id" UUID NOT NULL,
    "mentor_id" UUID,
    "tipo" "TipoServicoMentoria" NOT NULL,
    "titulo" VARCHAR(200) NOT NULL,
    "descricao" TEXT NOT NULL,
    "duracao_minutos" INTEGER NOT NULL,
    "preco" DECIMAL(14,2) NOT NULL,
    "moeda" CHAR(3) NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "servicos_mentoria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agendamentos_mentoria" (
    "id" UUID NOT NULL,
    "servico_id" UUID NOT NULL,
    "candidato_id" UUID NOT NULL,
    "inicio" TIMESTAMPTZ NOT NULL,
    "fim" TIMESTAMPTZ NOT NULL,
    "estado" "EstadoAgendamento" NOT NULL DEFAULT 'PENDENTE_PAGAMENTO',
    "link_reuniao" TEXT,
    "evento_externo_id" VARCHAR(255),
    "criado_em" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "agendamentos_mentoria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pagamentos" (
    "id" UUID NOT NULL,
    "agendamento_id" UUID NOT NULL,
    "fornecedor" VARCHAR(50) NOT NULL,
    "referencia_externa" VARCHAR(150),
    "valor" DECIMAL(14,2) NOT NULL,
    "moeda" CHAR(3) NOT NULL,
    "estado" "EstadoPagamento" NOT NULL DEFAULT 'PENDENTE',
    "confirmado_em" TIMESTAMPTZ,
    "criado_em" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pagamentos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "mentores_utilizador_id_key" ON "mentores"("utilizador_id");

-- CreateIndex
CREATE INDEX "servicos_mentoria_tipo_ativo_idx" ON "servicos_mentoria"("tipo", "ativo");

-- CreateIndex
CREATE INDEX "servicos_mentoria_mentor_id_idx" ON "servicos_mentoria"("mentor_id");

-- CreateIndex
CREATE INDEX "agendamentos_mentoria_candidato_id_estado_idx" ON "agendamentos_mentoria"("candidato_id", "estado");

-- CreateIndex
CREATE INDEX "agendamentos_mentoria_servico_id_inicio_idx" ON "agendamentos_mentoria"("servico_id", "inicio");

-- CreateIndex
CREATE INDEX "pagamentos_agendamento_id_idx" ON "pagamentos"("agendamento_id");

-- CreateIndex
CREATE UNIQUE INDEX "pagamentos_fornecedor_referencia_externa_key" ON "pagamentos"("fornecedor", "referencia_externa");

-- AddForeignKey
ALTER TABLE "mentores" ADD CONSTRAINT "mentores_utilizador_id_fkey" FOREIGN KEY ("utilizador_id") REFERENCES "utilizadores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "servicos_mentoria" ADD CONSTRAINT "servicos_mentoria_mentor_id_fkey" FOREIGN KEY ("mentor_id") REFERENCES "mentores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agendamentos_mentoria" ADD CONSTRAINT "agendamentos_mentoria_servico_id_fkey" FOREIGN KEY ("servico_id") REFERENCES "servicos_mentoria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agendamentos_mentoria" ADD CONSTRAINT "agendamentos_mentoria_candidato_id_fkey" FOREIGN KEY ("candidato_id") REFERENCES "utilizadores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagamentos" ADD CONSTRAINT "pagamentos_agendamento_id_fkey" FOREIGN KEY ("agendamento_id") REFERENCES "agendamentos_mentoria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
