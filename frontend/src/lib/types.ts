// Tipos alinhados com as respostas reais do backend (docs/api/README.md + services).
export type Papel = "CANDIDATO" | "ADMIN" | "MENTOR";
export type Utilizador = { id: string; nome: string; email: string; papel: Papel };

export type EstadoPrazo = "FUTURO" | "ABERTO" | "EXPIRADO" | "SEM_PRAZO_CONFIRMADO";
export type Financiamento = "INTEGRAL" | "PARCIAL" | "PROPINA" | "ESTIPENDIO" | "CURSO_GRATUITO" | "OUTRO";
export type Elegibilidade = "ELEGIVEL" | "NAO_ELEGIVEL" | "POR_CONFIRMAR";
export type Modalidade = "PRESENCIAL" | "ONLINE" | "HIBRIDA" | "NAO_APLICAVEL";
export type EstadoEditorial = "RASCUNHO" | "PENDENTE" | "VERIFICADA" | "PUBLICADA" | "REJEITADA" | "ARQUIVADA";
export type EstadoCandidatura =
  | "PLANEADA" | "EM_PREPARACAO" | "SUBMETIDA_EXTERNAMENTE" | "EM_AVALIACAO" | "ACEITE" | "REJEITADA" | "CANCELADA";

export type Meta = { pagina: number; limite: number; total: number; totalPaginas: number };
export type Pagina<T> = { data: T[]; meta: Meta };

export type Oportunidade = {
  id: string; titulo: string; entidadeFinanciadora: string;
  tipo: { codigo: string; nome: string };
  nivelEnsino: { codigo: string; nome: string } | null;
  paisDestinoCodigo: string | null; modalidade: Modalidade | null;
  tipoFinanciamento: Financiamento; valorFinanciamento: string | null; moeda: string | null;
  dataAbertura: string | null; prazoCandidatura: string | null;
  estadoPrazo: EstadoPrazo; elegibilidadeAngolanos: Elegibilidade;
  urlFonteOficial: string; ultimaVerificacaoEm: string | null;
};

export type OportunidadeDetalhe = Omit<Oportunidade, "tipo"> & {
  descricao: string; cicloAno: string | null; urlCandidatura: string | null;
  tipo: { codigo: string; nome: string; descricao: string };
  categorias: { nome: string; slug: string }[];
  regras: {
    tipoRegra: string; operador: string; valorTexto: string | null; valorNumerico: string | null;
    valorMinimo: string | null; valorMaximo: string | null; obrigatoriedade: string;
    estadoConfirmacao: string; textoFonte: string | null; urlFonte: string | null;
  }[];
  documentosExigidos: { nome: string; descricao: string | null; obrigatorio: boolean; estadoConfirmacao: string }[];
  elegibilidadePaises: { codigoPais: string; tipoCriterio: string; resultado: Elegibilidade; observacoes: string | null }[];
};

export type Favorito = {
  id: string; titulo: string; entidadeFinanciadora: string; tipo: { codigo: string; nome: string };
  estadoEditorial: EstadoEditorial; valorFinanciamento: string | null; moeda: string | null;
  prazoCandidatura: string | null; estadoPrazo: EstadoPrazo; urlFonteOficial: string; favoritadoEm: string;
};

export type Candidatura = {
  id: string; estado: EstadoCandidatura; notasPrivadas: string | null; dataSubmissaoExterna: string | null;
  criadoEm: string; atualizadoEm: string;
  oportunidade: {
    id: string; titulo: string; entidadeFinanciadora: string; estadoEditorial: EstadoEditorial;
    valorFinanciamento: string | null; moeda: string | null; prazoCandidatura: string | null; estadoPrazo: EstadoPrazo;
  };
  historico?: { estadoAnterior: EstadoCandidatura | null; estadoNovo: EstadoCandidatura; alteradoEm: string; observacao: string | null }[];
};

export type Perfil = {
  utilizadorId: string; nacionalidadeCodigo: string; dataNascimento: string | null; nivelEnsinoAtualId: string | null;
  areaEstudo: string | null; instituicaoEnsino: string | null; paisDestinoPreferido: string | null;
  idiomas: Record<string, string> | null;
};

export type OportunidadeAdmin = {
  id: string; titulo: string; entidadeFinanciadora: string; tipo: { codigo: string; nome: string };
  estadoEditorial: EstadoEditorial; tipoFinanciamento: Financiamento; valorFinanciamento: string | null;
  moeda: string | null; dataAbertura: string | null; prazoCandidatura: string | null; cicloAno: string | null;
  urlFonteOficial: string; urlCandidatura: string | null; atualizadoEm: string;
};
// GET /referencias (listas de apoio, com os IDs reais da base de dados)
export type TipoRef = { id: string; codigo: string; nome: string; descricao: string };
export type NivelRef = { id: string; codigo: string; nome: string; ordem: number };
export type CategoriaRef = { id: string; nome: string; slug: string };
export type Referencias = { tipos: TipoRef[]; niveis: NivelRef[]; categorias: CategoriaRef[] };

// GET /admin/oportunidades/:id (registo completo, para pré-preencher a edição)
export type OportunidadeAdminDetalhe = Omit<OportunidadeAdmin, "tipo"> & {
  tipo: { codigo: string; nome: string; descricao: string };
  descricao: string; tipoOportunidadeId: string; nivelEnsinoId: string | null;
  nivelEnsino: { codigo: string; nome: string } | null;
  paisDestinoCodigo: string | null; modalidade: Modalidade | null;
};
export type Metricas = { utilizadores: number; oportunidades: number; pendencias: number; candidaturas: number };
