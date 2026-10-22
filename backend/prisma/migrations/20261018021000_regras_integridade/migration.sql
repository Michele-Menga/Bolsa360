-- RF-24: uma candidatura ativa por utilizador+oportunidade
CREATE UNIQUE INDEX candidaturas_ativa_unica
  ON candidaturas (utilizador_id, oportunidade_id)
  WHERE estado NOT IN ('CANCELADA', 'REJEITADA');

-- Um mentor nao pode ter 2 sessoes sobrepostas (ativas ou em reserva)
CREATE EXTENSION IF NOT EXISTS btree_gist;
ALTER TABLE agendamentos_mentoria
  ADD CONSTRAINT agendamento_sem_sobreposicao
  EXCLUDE USING gist (mentor_id WITH =, tstzrange(inicio, fim) WITH &&)
  WHERE (estado IN ('PENDENTE_PAGAMENTO', 'CONFIRMADO'));