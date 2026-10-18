-- CreateEnum
CREATE TYPE "Papel" AS ENUM ('CANDIDATO', 'ADMIN');

-- CreateEnum
CREATE TYPE "EstadoUtilizador" AS ENUM ('ATIVO', 'SUSPENSO', 'DESATIVADO');

-- CreateEnum
CREATE TYPE "Modalidade" AS ENUM ('PRESENCIAL', 'ONLINE', 'HIBRIDA', 'NAO_APLICAVEL');

-- CreateEnum
CREATE TYPE "TipoFinanciamento" AS ENUM ('INTEGRAL', 'PARCIAL', 'PROPINA', 'ESTIPENDIO', 'CURSO_GRATUITO', 'OUTRO');

-- CreateEnum
CREATE TYPE "EstadoEditorial" AS ENUM ('RASCUNHO', 'PENDENTE', 'VERIFICADA', 'PUBLICADA', 'REJEITADA', 'ARQUIVADA');

-- CreateEnum
CREATE TYPE "TipoRegra" AS ENUM ('NACIONALIDADE', 'IDADE', 'NIVEL_ENSINO', 'NOTA_MINIMA', 'AREA_ESTUDO', 'INSTITUICAO', 'IDIOMA', 'RESIDENCIA', 'RENDIMENTO', 'EXPERIENCIA', 'DOCUMENTO', 'OUTRA');

-- CreateEnum
CREATE TYPE "OperadorRegra" AS ENUM ('IGUAL', 'DIFERENTE', 'MAIOR_IGUAL', 'MENOR_IGUAL', 'ENTRE', 'CONTEM', 'UM_DE', 'TEXTO_INFORMATIVO');

-- CreateEnum
CREATE TYPE "Obrigatoriedade" AS ENUM ('OBRIGATORIA', 'PREFERENCIAL', 'INFORMATIVA');

-- CreateEnum
CREATE TYPE "EstadoConfirmacao" AS ENUM ('CONFIRMADA', 'POR_CONFIRMAR', 'NAO_APLICAVEL');

-- CreateEnum
CREATE TYPE "TipoCriterio" AS ENUM ('NACIONALIDADE', 'RESIDENCIA');

-- CreateEnum
CREATE TYPE "ResultadoElegibilidade" AS ENUM ('ELEGIVEL', 'NAO_ELEGIVEL', 'POR_CONFIRMAR');

-- CreateEnum
CREATE TYPE "EstadoCandidatura" AS ENUM ('PLANEADA', 'EM_PREPARACAO', 'SUBMETIDA_EXTERNAMENTE', 'EM_AVALIACAO', 'ACEITE', 'REJEITADA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "EstadoVerificacao" AS ENUM ('PENDENTE', 'VERIFICADA', 'REJEITADA');

-- CreateTable
CREATE TABLE "utilizadores" (
    "id" UUID NOT NULL,
    "nome" VARCHAR(120) NOT NULL,
    "email" VARCHAR(254) NOT NULL,
    "palavra_passe_hash" TEXT NOT NULL,
    "papel" "Papel" NOT NULL DEFAULT 'CANDIDATO',
    "estado" "EstadoUtilizador" NOT NULL DEFAULT 'ATIVO',
    "criado_em" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "utilizadores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "perfis_candidato" (
    "utilizador_id" UUID NOT NULL,
    "nacionalidade_codigo" CHAR(2) NOT NULL,
    "data_nascimento" DATE,
    "nivel_ensino_atual_id" UUID,
    "area_estudo" VARCHAR(100),
    "instituicao_ensino" VARCHAR(200),
    "pais_destino_preferido" CHAR(2),
    "idiomas" JSONB,
    "criado_em" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "perfis_candidato_pkey" PRIMARY KEY ("utilizador_id")
);

-- CreateTable
CREATE TABLE "tipos_oportunidade" (
    "id" UUID NOT NULL,
    "nome" VARCHAR(80) NOT NULL,
    "codigo" VARCHAR(40) NOT NULL,
    "descricao" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "tipos_oportunidade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "niveis_ensino" (
    "id" UUID NOT NULL,
    "nome" VARCHAR(80) NOT NULL,
    "codigo" VARCHAR(40) NOT NULL,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "ativo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "niveis_ensino_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categorias_estudo" (
    "id" UUID NOT NULL,
    "nome" VARCHAR(100) NOT NULL,
    "slug" VARCHAR(120) NOT NULL,
    "descricao" TEXT,

    CONSTRAINT "categorias_estudo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "oportunidades" (
    "id" UUID NOT NULL,
    "titulo" VARCHAR(200) NOT NULL,
    "entidade_financiadora" VARCHAR(200) NOT NULL,
    "tipo_oportunidade_id" UUID NOT NULL,
    "descricao" TEXT NOT NULL,
    "nivel_ensino_id" UUID,
    "pais_destino_codigo" CHAR(2),
    "modalidade" "Modalidade" NOT NULL DEFAULT 'NAO_APLICAVEL',
    "tipo_financiamento" "TipoFinanciamento" NOT NULL,
    "valor_financiamento" DECIMAL(14,2),
    "moeda" CHAR(3),
    "data_abertura" DATE,
    "prazo_candidatura" DATE,
    "ciclo_ano" VARCHAR(20),
    "url_fonte_oficial" TEXT NOT NULL,
    "url_candidatura" TEXT,
    "estado_editorial" "EstadoEditorial" NOT NULL DEFAULT 'RASCUNHO',
    "ultima_verificacao_em" TIMESTAMPTZ,
    "criado_por_id" UUID NOT NULL,
    "criado_em" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "oportunidades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "oportunidades_categorias" (
    "oportunidade_id" UUID NOT NULL,
    "categoria_id" UUID NOT NULL,

    CONSTRAINT "oportunidades_categorias_pkey" PRIMARY KEY ("oportunidade_id","categoria_id")
);

-- CreateTable
CREATE TABLE "regras_elegibilidade" (
    "id" UUID NOT NULL,
    "oportunidade_id" UUID NOT NULL,
    "tipo_regra" "TipoRegra" NOT NULL,
    "operador" "OperadorRegra" NOT NULL,
    "valor_texto" TEXT,
    "valor_numerico" DECIMAL(10,2),
    "valor_minimo" DECIMAL(10,2),
    "valor_maximo" DECIMAL(10,2),
    "obrigatoriedade" "Obrigatoriedade" NOT NULL DEFAULT 'OBRIGATORIA',
    "estado_confirmacao" "EstadoConfirmacao" NOT NULL DEFAULT 'POR_CONFIRMAR',
    "texto_fonte" TEXT NOT NULL,
    "url_fonte" TEXT NOT NULL,
    "ordem_exibicao" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "regras_elegibilidade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "elegibilidades_pais" (
    "id" UUID NOT NULL,
    "oportunidade_id" UUID NOT NULL,
    "codigo_pais" CHAR(2) NOT NULL,
    "tipo_criterio" "TipoCriterio" NOT NULL,
    "resultado" "ResultadoElegibilidade" NOT NULL DEFAULT 'POR_CONFIRMAR',
    "observacoes" TEXT,

    CONSTRAINT "elegibilidades_pais_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documentos_exigidos" (
    "id" UUID NOT NULL,
    "oportunidade_id" UUID NOT NULL,
    "nome" VARCHAR(150) NOT NULL,
    "descricao" TEXT,
    "obrigatorio" BOOLEAN NOT NULL DEFAULT true,
    "estado_confirmacao" "EstadoConfirmacao" NOT NULL DEFAULT 'POR_CONFIRMAR',
    "url_fonte" TEXT,

    CONSTRAINT "documentos_exigidos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verificacoes_oportunidade" (
    "id" UUID NOT NULL,
    "oportunidade_id" UUID NOT NULL,
    "administrador_id" UUID NOT NULL,
    "estado" "EstadoVerificacao" NOT NULL DEFAULT 'PENDENTE',
    "verificada_em" TIMESTAMPTZ,
    "url_consultada" TEXT NOT NULL,
    "notas" TEXT,

    CONSTRAINT "verificacoes_oportunidade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "favoritos" (
    "utilizador_id" UUID NOT NULL,
    "oportunidade_id" UUID NOT NULL,
    "criado_em" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favoritos_pkey" PRIMARY KEY ("utilizador_id","oportunidade_id")
);

-- CreateTable
CREATE TABLE "candidaturas" (
    "id" UUID NOT NULL,
    "utilizador_id" UUID NOT NULL,
    "oportunidade_id" UUID NOT NULL,
    "estado" "EstadoCandidatura" NOT NULL DEFAULT 'PLANEADA',
    "notas_privadas" TEXT,
    "data_submissao_externa" DATE,
    "criado_em" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "candidaturas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "historico_candidaturas" (
    "id" UUID NOT NULL,
    "candidatura_id" UUID NOT NULL,
    "estado_anterior" "EstadoCandidatura",
    "estado_novo" "EstadoCandidatura" NOT NULL,
    "alterado_por_id" UUID NOT NULL,
    "alterado_em" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "observacao" TEXT,

    CONSTRAINT "historico_candidaturas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "registos_auditoria" (
    "id" UUID NOT NULL,
    "ator_utilizador_id" UUID,
    "acao" VARCHAR(80) NOT NULL,
    "tipo_entidade" VARCHAR(80) NOT NULL,
    "entidade_id" UUID,
    "detalhes_minimos" JSONB,
    "endereco_ip" INET,
    "criado_em" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "registos_auditoria_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "utilizadores_email_key" ON "utilizadores"("email");

-- CreateIndex
CREATE UNIQUE INDEX "tipos_oportunidade_nome_key" ON "tipos_oportunidade"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "tipos_oportunidade_codigo_key" ON "tipos_oportunidade"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "niveis_ensino_nome_key" ON "niveis_ensino"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "niveis_ensino_codigo_key" ON "niveis_ensino"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "categorias_estudo_nome_key" ON "categorias_estudo"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "categorias_estudo_slug_key" ON "categorias_estudo"("slug");

-- CreateIndex
CREATE INDEX "oportunidades_estado_editorial_idx" ON "oportunidades"("estado_editorial");

-- CreateIndex
CREATE INDEX "oportunidades_prazo_candidatura_idx" ON "oportunidades"("prazo_candidatura");

-- CreateIndex
CREATE INDEX "oportunidades_tipo_oportunidade_id_idx" ON "oportunidades"("tipo_oportunidade_id");

-- CreateIndex
CREATE INDEX "oportunidades_pais_destino_codigo_idx" ON "oportunidades"("pais_destino_codigo");

-- CreateIndex
CREATE INDEX "oportunidades_titulo_idx" ON "oportunidades"("titulo");

-- CreateIndex
CREATE INDEX "oportunidades_categorias_categoria_id_idx" ON "oportunidades_categorias"("categoria_id");

-- CreateIndex
CREATE INDEX "regras_elegibilidade_oportunidade_id_idx" ON "regras_elegibilidade"("oportunidade_id");

-- CreateIndex
CREATE INDEX "elegibilidades_pais_codigo_pais_resultado_idx" ON "elegibilidades_pais"("codigo_pais", "resultado");

-- CreateIndex
CREATE UNIQUE INDEX "elegibilidades_pais_oportunidade_id_codigo_pais_tipo_criter_key" ON "elegibilidades_pais"("oportunidade_id", "codigo_pais", "tipo_criterio");

-- CreateIndex
CREATE INDEX "documentos_exigidos_oportunidade_id_idx" ON "documentos_exigidos"("oportunidade_id");

-- CreateIndex
CREATE INDEX "verificacoes_oportunidade_oportunidade_id_idx" ON "verificacoes_oportunidade"("oportunidade_id");

-- CreateIndex
CREATE INDEX "favoritos_oportunidade_id_idx" ON "favoritos"("oportunidade_id");

-- CreateIndex
CREATE INDEX "candidaturas_utilizador_id_estado_idx" ON "candidaturas"("utilizador_id", "estado");

-- CreateIndex
CREATE INDEX "candidaturas_oportunidade_id_idx" ON "candidaturas"("oportunidade_id");

-- CreateIndex
CREATE INDEX "historico_candidaturas_candidatura_id_alterado_em_idx" ON "historico_candidaturas"("candidatura_id", "alterado_em");

-- CreateIndex
CREATE INDEX "registos_auditoria_tipo_entidade_entidade_id_idx" ON "registos_auditoria"("tipo_entidade", "entidade_id");

-- CreateIndex
CREATE INDEX "registos_auditoria_ator_utilizador_id_idx" ON "registos_auditoria"("ator_utilizador_id");

-- CreateIndex
CREATE INDEX "registos_auditoria_criado_em_idx" ON "registos_auditoria"("criado_em");

-- AddForeignKey
ALTER TABLE "perfis_candidato" ADD CONSTRAINT "perfis_candidato_utilizador_id_fkey" FOREIGN KEY ("utilizador_id") REFERENCES "utilizadores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "perfis_candidato" ADD CONSTRAINT "perfis_candidato_nivel_ensino_atual_id_fkey" FOREIGN KEY ("nivel_ensino_atual_id") REFERENCES "niveis_ensino"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "oportunidades" ADD CONSTRAINT "oportunidades_tipo_oportunidade_id_fkey" FOREIGN KEY ("tipo_oportunidade_id") REFERENCES "tipos_oportunidade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "oportunidades" ADD CONSTRAINT "oportunidades_nivel_ensino_id_fkey" FOREIGN KEY ("nivel_ensino_id") REFERENCES "niveis_ensino"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "oportunidades" ADD CONSTRAINT "oportunidades_criado_por_id_fkey" FOREIGN KEY ("criado_por_id") REFERENCES "utilizadores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "oportunidades_categorias" ADD CONSTRAINT "oportunidades_categorias_oportunidade_id_fkey" FOREIGN KEY ("oportunidade_id") REFERENCES "oportunidades"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "oportunidades_categorias" ADD CONSTRAINT "oportunidades_categorias_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "categorias_estudo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "regras_elegibilidade" ADD CONSTRAINT "regras_elegibilidade_oportunidade_id_fkey" FOREIGN KEY ("oportunidade_id") REFERENCES "oportunidades"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "elegibilidades_pais" ADD CONSTRAINT "elegibilidades_pais_oportunidade_id_fkey" FOREIGN KEY ("oportunidade_id") REFERENCES "oportunidades"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documentos_exigidos" ADD CONSTRAINT "documentos_exigidos_oportunidade_id_fkey" FOREIGN KEY ("oportunidade_id") REFERENCES "oportunidades"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verificacoes_oportunidade" ADD CONSTRAINT "verificacoes_oportunidade_oportunidade_id_fkey" FOREIGN KEY ("oportunidade_id") REFERENCES "oportunidades"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verificacoes_oportunidade" ADD CONSTRAINT "verificacoes_oportunidade_administrador_id_fkey" FOREIGN KEY ("administrador_id") REFERENCES "utilizadores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favoritos" ADD CONSTRAINT "favoritos_utilizador_id_fkey" FOREIGN KEY ("utilizador_id") REFERENCES "utilizadores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favoritos" ADD CONSTRAINT "favoritos_oportunidade_id_fkey" FOREIGN KEY ("oportunidade_id") REFERENCES "oportunidades"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidaturas" ADD CONSTRAINT "candidaturas_utilizador_id_fkey" FOREIGN KEY ("utilizador_id") REFERENCES "utilizadores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidaturas" ADD CONSTRAINT "candidaturas_oportunidade_id_fkey" FOREIGN KEY ("oportunidade_id") REFERENCES "oportunidades"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historico_candidaturas" ADD CONSTRAINT "historico_candidaturas_candidatura_id_fkey" FOREIGN KEY ("candidatura_id") REFERENCES "candidaturas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historico_candidaturas" ADD CONSTRAINT "historico_candidaturas_alterado_por_id_fkey" FOREIGN KEY ("alterado_por_id") REFERENCES "utilizadores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registos_auditoria" ADD CONSTRAINT "registos_auditoria_ator_utilizador_id_fkey" FOREIGN KEY ("ator_utilizador_id") REFERENCES "utilizadores"("id") ON DELETE SET NULL ON UPDATE CASCADE;
