-- RNF-12: índices para os filtros e consultas frequentes do catálogo público.

-- Índice composto: o catálogo só mostra oportunidades PUBLICADA (RN-01)
-- e filtra/ordena sempre pelo prazo de candidatura.
CREATE INDEX oportunidades_estado_prazo_idx
  ON oportunidades (estado_editorial, prazo_candidatura);

-- Pesquisa de texto por título e entidade financiadora. O Prisma gera
-- ILIKE '%texto%', que não usa índices B-tree; pg_trgm + GIN acelera isto.
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX oportunidades_titulo_trgm_idx
  ON oportunidades USING gin (titulo gin_trgm_ops);

CREATE INDEX oportunidades_entidade_trgm_idx
  ON oportunidades USING gin (entidade_financiadora gin_trgm_ops);
