-- Criar a extensão no schema public se ainda não existir
CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA public;

-- 1. Índice composto para o catálogo público (estado editorial + prazo)
CREATE INDEX IF NOT EXISTS "oportunidades_estado_prazo_idx" 
ON "public"."oportunidades" ("estado_editorial", "prazo_candidatura");

-- 2. Índices de pesquisa por texto usando pg_trgm qualificados para o schema public
CREATE INDEX IF NOT EXISTS "oportunidades_titulo_trgm_idx" 
ON "public"."oportunidades" USING gin ("titulo" public.gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "oportunidades_entidade_trgm_idx" 
ON "public"."oportunidades" USING gin ("entidade_financiadora" public.gin_trgm_ops);