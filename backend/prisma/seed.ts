/**
 * Seeder do Bolsa360.
 *
 * Cria dados de demonstração claramente identificados como FICTÍCIOS ([DEMO]),
 * coerentes com o documento de engenharia de software e com o schema Prisma.
 *
 * É idempotente: usa upsert com IDs fixos, pelo que pode ser executado várias
 * vezes sem duplicar registos.
 *
 * Requer as variáveis de ambiente SEED_ADMIN_PASSWORD e SEED_DEMO_PASSWORD
 * (ver backend/.env.example). Cada pessoa usa as suas e só contra BD local.
 *
 * Executar (dentro de backend/):  npx prisma db seed   ou   npm run db:seed
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import argon2 from "argon2";

const prisma = new PrismaClient();

// ----------------------------------------------------------------------------
// Palavras-passe
//
// Nunca são escritas no código nem impressas. Vêm do .env.
// O hash usa Argon2id (RNF-02), o mesmo que o login vai usar.
// ----------------------------------------------------------------------------
function lerPalavraPasse(nomeVariavel: string): string {
  const valor = process.env[nomeVariavel];
  if (
    !valor ||
    valor.trim() === "" ||
    valor === "TROCAR-ANTES-DE-CORRER" ||
    valor.length < 8
  ) {
    throw new Error(
      `Variável de ambiente ${nomeVariavel} em falta ou inválida. ` +
      "Define uma palavra-passe com pelo menos 8 caracteres no backend/.env " +
      "(usa o backend/.env.example como modelo).",
    );
  }
  return valor;
}

async function hashArgon2id(palavraPasse: string): Promise<string> {
  return argon2.hash(palavraPasse, { type: argon2.argon2id });
}

// IDs fixos (UUIDs válidos) para garantir idempotência entre execuções.
const ID = {
  admin: "00000000-0000-4000-8000-000000000001",

  candidato1: "00000000-0000-4000-8000-000000000011",
  candidato2: "00000000-0000-4000-8000-000000000012",
  candidato3: "00000000-0000-4000-8000-000000000013",

  mentorUser1: "00000000-0000-4000-8000-000000000021",
  mentorUser2: "00000000-0000-4000-8000-000000000022",
  mentorUser3: "00000000-0000-4000-8000-000000000023",

  // Tipos de oportunidade (secção 11.1 do documento).
  tipoBolsaUniversitaria: "00000000-0000-4000-8000-000000000101",
  tipoBolsaEnsinoMedio: "00000000-0000-4000-8000-000000000102",
  tipoBolsaLingua: "00000000-0000-4000-8000-000000000103",
  tipoBolsaTecnica: "00000000-0000-4000-8000-000000000104",
  tipoCursoCurto: "00000000-0000-4000-8000-000000000105",
  tipoIntercambio: "00000000-0000-4000-8000-000000000106",
  tipoInvestigacao: "00000000-0000-4000-8000-000000000107",
  tipoMerito: "00000000-0000-4000-8000-000000000108",
  tipoNecessidadeFinanceira: "00000000-0000-4000-8000-000000000109",
  tipoEstagio: "00000000-0000-4000-8000-00000000010a",
  tipoProgramaJuvenil: "00000000-0000-4000-8000-00000000010b",
  tipoOutra: "00000000-0000-4000-8000-00000000010c",

  nivelMedio: "00000000-0000-4000-8000-000000000201",
  nivelLicenciatura: "00000000-0000-4000-8000-000000000202",
  nivelMestrado: "00000000-0000-4000-8000-000000000203",
  nivelDoutoramento: "00000000-0000-4000-8000-000000000204",
  nivelPos: "00000000-0000-4000-8000-000000000205",
  nivelTecnico: "00000000-0000-4000-8000-000000000206",

  catEngenharia: "00000000-0000-4000-8000-000000000301",
  catSaude: "00000000-0000-4000-8000-000000000302",
  catSociais: "00000000-0000-4000-8000-000000000303",
  catTecnologia: "00000000-0000-4000-8000-000000000304",
  catAgricultura: "00000000-0000-4000-8000-000000000305",
  catGestao: "00000000-0000-4000-8000-000000000306",
  catArtes: "00000000-0000-4000-8000-000000000307",
  catEducacao: "00000000-0000-4000-8000-000000000308",
  catLinguas: "00000000-0000-4000-8000-000000000309",

  oportunidade1: "00000000-0000-4000-8000-000000000401",
  oportunidade2: "00000000-0000-4000-8000-000000000402",
  oportunidade3: "00000000-0000-4000-8000-000000000403",
  oportunidade4: "00000000-0000-4000-8000-000000000404",
  oportunidade5: "00000000-0000-4000-8000-000000000405",
  oportunidade6: "00000000-0000-4000-8000-000000000406",

  mentor1: "00000000-0000-4000-8000-000000000501",
  mentor2: "00000000-0000-4000-8000-000000000502",
  mentor3: "00000000-0000-4000-8000-000000000503",

  servicoGeral1: "00000000-0000-4000-8000-000000000601",
  servicoGeral2: "00000000-0000-4000-8000-000000000602",
  servicoPersonalizado1: "00000000-0000-4000-8000-000000000603",
  servicoPersonalizado2: "00000000-0000-4000-8000-000000000604",

  agendamento1: "00000000-0000-4000-8000-000000000701",
  agendamento2: "00000000-0000-4000-8000-000000000702",

  pagamento1: "00000000-0000-4000-8000-000000000801",
  pagamento2: "00000000-0000-4000-8000-000000000802",
  pagamento3: "00000000-0000-4000-8000-000000000803",

  evento1: "00000000-0000-4000-8000-000000000901",
  evento2: "00000000-0000-4000-8000-000000000902",

  acesso1: "00000000-0000-4000-8000-000000001001",

  conversa1: "00000000-0000-4000-8000-000000001101",
  mensagem1: "00000000-0000-4000-8000-000000001201",
  mensagem2: "00000000-0000-4000-8000-000000001202",

  candidatura1: "00000000-0000-4000-8000-000000001301",
  candidatura2: "00000000-0000-4000-8000-000000001302",
} as const;

// ----------------------------------------------------------------------------
// Datas RELATIVAS ao momento de execução, para a demonstração não "apodrecer".
// ----------------------------------------------------------------------------
const agora = new Date();
const DIA_MS = 24 * 60 * 60 * 1000;
const daqui = (dias: number): Date => new Date(agora.getTime() + dias * DIA_MS);
const daquiAs = (dias: number, horas: number, minutos = 0): Date => {
  const d = daqui(dias);
  d.setHours(horas, minutos, 0, 0);
  return d;
};

// Endereços de demonstração: nunca apontam para sites reais.
const URL_DEMO = "https://example.org/demo";
const URL_DEMO_CANDIDATURA = "https://example.org/demo/candidatura";

async function main() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Seed proibido em produção");
  }

  console.log("A semear dados de demonstração do Bolsa360...");

  const palavraPasseAdmin = lerPalavraPasse("SEED_ADMIN_PASSWORD");
  const palavraPasseDemo = lerPalavraPasse("SEED_DEMO_PASSWORD");

  // ---------------------------------------------------------------- CATÁLOGOS
  // Tipos de oportunidade conforme a secção 11.1 do documento de requisitos.
  const tipos = [
    { id: ID.tipoBolsaUniversitaria, nome: "Bolsa universitária", codigo: "BOLSA_UNIVERSITARIA", descricao: "Apoio financeiro para estudos superiores (licenciatura ou mestrado)." },
    { id: ID.tipoBolsaEnsinoMedio, nome: "Bolsa para ensino médio", codigo: "BOLSA_ENSINO_MEDIO", descricao: "Apoio financeiro para conclusão do ensino médio." },
    { id: ID.tipoBolsaLingua, nome: "Bolsa de língua", codigo: "BOLSA_LINGUA", descricao: "Financiamento de cursos de línguas estrangeiras." },
    { id: ID.tipoBolsaTecnica, nome: "Bolsa técnica/profissional", codigo: "BOLSA_TECNICA", descricao: "Formação técnica ou profissionalizante financiada." },
    { id: ID.tipoCursoCurto, nome: "Curso curto/formação financiada", codigo: "CURSO_CURTO", descricao: "Cursos curtos e formações financiadas." },
    { id: ID.tipoIntercambio, nome: "Intercâmbio académico", codigo: "INTERCAMBIO", descricao: "Mobilidade académica entre instituições." },
    { id: ID.tipoInvestigacao, nome: "Investigação/fellowship", codigo: "INVESTIGACAO", descricao: "Apoio a projetos de investigação e fellowships." },
    { id: ID.tipoMerito, nome: "Bolsa de mérito", codigo: "MERITO", descricao: "Atribuída com base no desempenho académico." },
    { id: ID.tipoNecessidadeFinanceira, nome: "Bolsa por necessidade financeira", codigo: "NECESSIDADE_FINANCEIRA", descricao: "Atribuída com base na situação económica do candidato." },
    { id: ID.tipoEstagio, nome: "Bolsa de estágio/aprendizagem", codigo: "ESTAGIO", descricao: "Estágios e programas de aprendizagem remunerados." },
    { id: ID.tipoProgramaJuvenil, nome: "Programa juvenil ou de liderança", codigo: "PROGRAMA_JUVENIL", descricao: "Programas de desenvolvimento juvenil e liderança." },
    { id: ID.tipoOutra, nome: "Outra oportunidade financiada", codigo: "OUTRA", descricao: "Outras oportunidades de financiamento não categorizadas." },
  ];
  for (const t of tipos) {
    await prisma.tipoOportunidade.upsert({ where: { id: t.id }, update: t, create: t });
  }

  const niveis = [
    { id: ID.nivelMedio, nome: "Ensino Médio", codigo: "ENSINO_MEDIO", ordem: 1 },
    { id: ID.nivelTecnico, nome: "Curso Técnico", codigo: "CURSO_TECNICO", ordem: 2 },
    { id: ID.nivelLicenciatura, nome: "Licenciatura", codigo: "LICENCIATURA", ordem: 3 },
    { id: ID.nivelPos, nome: "Pós-Graduação", codigo: "POS_GRADUACAO", ordem: 4 },
    { id: ID.nivelMestrado, nome: "Mestrado", codigo: "MESTRADO", ordem: 5 },
    { id: ID.nivelDoutoramento, nome: "Doutoramento", codigo: "DOUTORAMENTO", ordem: 6 },
  ];
  for (const n of niveis) {
    await prisma.nivelEnsino.upsert({ where: { id: n.id }, update: n, create: n });
  }

  const categorias = [
    { id: ID.catEngenharia, nome: "Engenharia", slug: "engenharia", descricao: "Engenharias civil, mecânica, elétrica e afins." },
    { id: ID.catSaude, nome: "Saúde", slug: "saude", descricao: "Medicina, enfermagem e ciências da saúde." },
    { id: ID.catSociais, nome: "Ciências Sociais", slug: "ciencias-sociais", descricao: "Direito, economia, sociologia e afins." },
    { id: ID.catTecnologia, nome: "Tecnologia", slug: "tecnologia", descricao: "Informática, engenharia de software e dados." },
    { id: ID.catAgricultura, nome: "Agricultura", slug: "agricultura", descricao: "Agronomia, veterinária e ciências agrárias." },
    { id: ID.catGestao, nome: "Gestão e Negócios", slug: "gestao-negocios", descricao: "Administração, contabilidade e gestão." },
    { id: ID.catArtes, nome: "Artes e Humanidades", slug: "artes-humanidades", descricao: "Letras, artes e ciências humanas." },
    { id: ID.catEducacao, nome: "Educação", slug: "educacao", descricao: "Formação de professores e ciências da educação." },
    { id: ID.catLinguas, nome: "Línguas", slug: "linguas", descricao: "Aprendizagem e ensino de línguas estrangeiras." },
  ];
  for (const c of categorias) {
    await prisma.categoriaEstudo.upsert({ where: { id: c.id }, update: c, create: c });
  }

  // -------------------------------------------------------------- UTILIZADORES
  const contas = [
    { id: ID.admin, nome: "Administrador Bolsa360 (demo)", email: "admin@example.org", papel: "ADMIN" as const, palavraPasse: palavraPasseAdmin },
    { id: ID.candidato1, nome: "Ana Domingos (demo)", email: "ana.demo@example.org", papel: "CANDIDATO" as const, palavraPasse: palavraPasseDemo },
    { id: ID.candidato2, nome: "Bruno Mateus (demo)", email: "bruno.demo@example.org", papel: "CANDIDATO" as const, palavraPasse: palavraPasseDemo },
    { id: ID.candidato3, nome: "Carla Nzuzi (demo)", email: "carla.demo@example.org", papel: "CANDIDATO" as const, palavraPasse: palavraPasseDemo },
    { id: ID.mentorUser1, nome: "Daniel Sousa (demo)", email: "daniel.demo@example.org", papel: "MENTOR" as const, palavraPasse: palavraPasseDemo },
    { id: ID.mentorUser2, nome: "Elsa Camalanga (demo)", email: "elsa.demo@example.org", papel: "MENTOR" as const, palavraPasse: palavraPasseDemo },
    { id: ID.mentorUser3, nome: "Filipe Barros (demo)", email: "filipe.demo@example.org", papel: "MENTOR" as const, palavraPasse: palavraPasseDemo },
  ];
  for (const c of contas) {
    const palavraPasseHash = await hashArgon2id(c.palavraPasse);
    await prisma.utilizador.upsert({
      where: { id: c.id },
      // O update nunca toca em palavraPasseHash.
      update: { nome: c.nome, email: c.email, papel: c.papel },
      create: {
        id: c.id,
        nome: c.nome,
        email: c.email,
        papel: c.papel,
        palavraPasseHash,
      },
    });
  }

  const perfis = [
    {
      utilizadorId: ID.candidato1,
      nacionalidadeCodigo: "AO",
      dataNascimento: new Date("2002-04-15"),
      nivelEnsinoAtualId: ID.nivelLicenciatura,
      areaEstudo: "Engenharia Informática",
      instituicaoEnsino: "Universidade Exemplo 1 (demo)",
      paisDestinoPreferido: "PT",
      idiomas: { pt: "Nativo", en: "B2" },
    },
    {
      utilizadorId: ID.candidato2,
      nacionalidadeCodigo: "AO",
      dataNascimento: new Date("1999-09-02"),
      nivelEnsinoAtualId: ID.nivelMestrado,
      areaEstudo: "Gestão de Empresas",
      instituicaoEnsino: "Universidade Exemplo 2 (demo)",
      paisDestinoPreferido: "ZA",
      idiomas: { pt: "Nativo", en: "C1", fr: "A2" },
    },
    {
      utilizadorId: ID.candidato3,
      nacionalidadeCodigo: "AO",
      dataNascimento: new Date("2004-01-20"),
      nivelEnsinoAtualId: ID.nivelMedio,
      areaEstudo: "Ciências Biológicas",
      instituicaoEnsino: "Instituto Exemplo 3 (demo)",
      paisDestinoPreferido: "BR",
      idiomas: { pt: "Nativo", en: "B1" },
    },
  ];
  for (const p of perfis) {
    await prisma.perfilCandidato.upsert({ where: { utilizadorId: p.utilizadorId }, update: p, create: p });
  }

  // ------------------------------------------------------------- OPORTUNIDADES
  // Todas fictícias, marcadas com [DEMO], com datas relativas a hoje.
  const DESC_BASE = "Dados fictícios de demonstração. Não é uma oportunidade real.";

  const oportunidades = [
    {
      id: ID.oportunidade1,
      titulo: "[DEMO] Bolsa universitária integral (aberta)",
      entidadeFinanciadora: "Fundação Exemplo A",
      tipoOportunidadeId: ID.tipoBolsaUniversitaria,
      descricao: `${DESC_BASE} Serve para testar uma bolsa integral aberta para mestrado.`,
      nivelEnsinoId: ID.nivelMestrado,
      paisDestinoCodigo: "PT",
      modalidade: "PRESENCIAL" as const,
      tipoFinanciamento: "INTEGRAL" as const,
      valorFinanciamento: 12000,
      moeda: "EUR",
      dataAbertura: daqui(-30),
      prazoCandidatura: daqui(60),
      cicloAno: "2026/2027",
      urlFonteOficial: URL_DEMO,
      urlCandidatura: URL_DEMO_CANDIDATURA,
      estadoEditorial: "PUBLICADA" as const,
      ultimaVerificacaoEm: daqui(-2),
    },
    {
      id: ID.oportunidade2,
      titulo: "[DEMO] Curso de língua (prazo próximo)",
      entidadeFinanciadora: "Instituto Exemplo B",
      tipoOportunidadeId: ID.tipoBolsaLingua,
      descricao: `${DESC_BASE} Serve para testar um prazo de candidatura próximo.`,
      nivelEnsinoId: null,
      paisDestinoCodigo: "CN",
      modalidade: "ONLINE" as const,
      tipoFinanciamento: "CURSO_GRATUITO" as const,
      valorFinanciamento: 0,
      moeda: "USD",
      dataAbertura: daqui(-20),
      prazoCandidatura: daqui(5),
      cicloAno: "2026",
      urlFonteOficial: URL_DEMO,
      urlCandidatura: URL_DEMO_CANDIDATURA,
      estadoEditorial: "PUBLICADA" as const,
      ultimaVerificacaoEm: daqui(-1),
    },
    {
      id: ID.oportunidade3,
      titulo: "[DEMO] Intercâmbio (abre em breve)",
      entidadeFinanciadora: "Fundação Exemplo C",
      tipoOportunidadeId: ID.tipoIntercambio,
      descricao: `${DESC_BASE} Serve para testar uma oportunidade que ainda não abriu.`,
      nivelEnsinoId: ID.nivelLicenciatura,
      paisDestinoCodigo: "BR",
      modalidade: "PRESENCIAL" as const,
      tipoFinanciamento: "PARCIAL" as const,
      valorFinanciamento: 3500,
      moeda: "EUR",
      dataAbertura: daqui(20),
      prazoCandidatura: daqui(90),
      cicloAno: "2027",
      urlFonteOficial: URL_DEMO,
      urlCandidatura: URL_DEMO_CANDIDATURA,
      estadoEditorial: "PUBLICADA" as const,
      ultimaVerificacaoEm: daqui(-3),
    },
    {
      id: ID.oportunidade4,
      titulo: "[DEMO] Formação técnica (sem prazo divulgado)",
      entidadeFinanciadora: "Instituto Exemplo D",
      tipoOportunidadeId: ID.tipoBolsaTecnica,
      descricao: `${DESC_BASE} Serve para testar uma oportunidade sem datas divulgadas.`,
      nivelEnsinoId: ID.nivelTecnico,
      paisDestinoCodigo: null,
      modalidade: "ONLINE" as const,
      tipoFinanciamento: "CURSO_GRATUITO" as const,
      valorFinanciamento: 0,
      moeda: "USD",
      dataAbertura: null,
      prazoCandidatura: null,
      cicloAno: null,
      urlFonteOficial: URL_DEMO,
      urlCandidatura: null,
      estadoEditorial: "PUBLICADA" as const,
      ultimaVerificacaoEm: daqui(-4),
    },
    {
      id: ID.oportunidade5,
      titulo: "[DEMO] Bolsa de mérito já encerrada",
      entidadeFinanciadora: "Fundação Exemplo E",
      tipoOportunidadeId: ID.tipoMerito,
      descricao: `${DESC_BASE} Serve para testar uma oportunidade com prazo já expirado.`,
      nivelEnsinoId: ID.nivelLicenciatura,
      paisDestinoCodigo: "PT",
      modalidade: "PRESENCIAL" as const,
      tipoFinanciamento: "PARCIAL" as const,
      valorFinanciamento: 5000,
      moeda: "EUR",
      dataAbertura: daqui(-90),
      prazoCandidatura: daqui(-10),
      cicloAno: "2026",
      urlFonteOficial: URL_DEMO,
      urlCandidatura: URL_DEMO_CANDIDATURA,
      estadoEditorial: "PUBLICADA" as const,
      ultimaVerificacaoEm: daqui(-6),
    },
    {
      id: ID.oportunidade6,
      titulo: "[DEMO] Estágio em revisão editorial",
      entidadeFinanciadora: "Empresa Exemplo F",
      tipoOportunidadeId: ID.tipoEstagio,
      descricao: `${DESC_BASE} Serve para testar uma oportunidade em revisão (não aparece no catálogo público).`,
      nivelEnsinoId: ID.nivelLicenciatura,
      paisDestinoCodigo: "BR",
      modalidade: "PRESENCIAL" as const,
      tipoFinanciamento: "ESTIPENDIO" as const,
      valorFinanciamento: null,
      moeda: null,
      dataAbertura: daqui(-10),
      prazoCandidatura: daqui(45),
      cicloAno: null,
      urlFonteOficial: URL_DEMO,
      urlCandidatura: URL_DEMO_CANDIDATURA,
      estadoEditorial: "PENDENTE" as const,
      ultimaVerificacaoEm: null,
    },
  ];
  for (const o of oportunidades) {
    await prisma.oportunidade.upsert({
      where: { id: o.id },
      update: { ...o, criadoPorId: ID.admin },
      create: { ...o, criadoPorId: ID.admin },
    });
  }

  // Categorias por oportunidade
  const oportCategorias: Array<[string, string]> = [
    [ID.oportunidade1, ID.catEngenharia],
    [ID.oportunidade1, ID.catTecnologia],
    [ID.oportunidade2, ID.catLinguas],
    [ID.oportunidade3, ID.catEngenharia],
    [ID.oportunidade3, ID.catGestao],
    [ID.oportunidade4, ID.catTecnologia],
    [ID.oportunidade5, ID.catEducacao],
    [ID.oportunidade5, ID.catGestao],
    [ID.oportunidade6, ID.catAgricultura],
    [ID.oportunidade6, ID.catEducacao],
  ];
  for (const [oportunidadeId, categoriaId] of oportCategorias) {
    await prisma.oportunidadeCategoria.upsert({
      where: { oportunidadeId_categoriaId: { oportunidadeId, categoriaId } },
      update: {},
      create: { oportunidadeId, categoriaId },
    });
  }

  // Regras de elegibilidade (sem ID fixo: limpa e recria por oportunidade)
  await prisma.regraElegibilidade.deleteMany({
    where: { oportunidadeId: { in: oportunidades.map((o) => o.id) } },
  });
  const regras = [
    {
      oportunidadeId: ID.oportunidade1,
      tipoRegra: "NOTA_MINIMA" as const,
      operador: "MAIOR_IGUAL" as const,
      valorNumerico: 14,
      obrigatoriedade: "OBRIGATORIA" as const,
      estadoConfirmacao: "CONFIRMADA" as const,
      textoFonte: "Demonstração: exige média mínima de 14 valores na licenciatura.",
      urlFonte: URL_DEMO,
    },
    {
      oportunidadeId: ID.oportunidade1,
      tipoRegra: "IDIOMA" as const,
      operador: "IGUAL" as const,
      valorTexto: "Inglês B2 ou Português C1",
      obrigatoriedade: "OBRIGATORIA" as const,
      estadoConfirmacao: "POR_CONFIRMAR" as const,
      textoFonte: "Demonstração: requisito de língua ainda por confirmar na fonte.",
      urlFonte: URL_DEMO,
    },
    {
      oportunidadeId: ID.oportunidade2,
      tipoRegra: "IDADE" as const,
      operador: "MAIOR_IGUAL" as const,
      valorNumerico: 16,
      obrigatoriedade: "OBRIGATORIA" as const,
      estadoConfirmacao: "POR_CONFIRMAR" as const,
      textoFonte: "Demonstração: idade mínima de 16 anos, por confirmar.",
      urlFonte: URL_DEMO,
    },
    {
      oportunidadeId: ID.oportunidade3,
      tipoRegra: "NIVEL_ENSINO" as const,
      operador: "IGUAL" as const,
      valorTexto: "Licenciatura",
      obrigatoriedade: "OBRIGATORIA" as const,
      estadoConfirmacao: "CONFIRMADA" as const,
      textoFonte: "Demonstração: destinado a estudantes inscritos numa licenciatura.",
      urlFonte: URL_DEMO,
    },
  ];
  for (const [i, r] of regras.entries()) {
    await prisma.regraElegibilidade.create({ data: { ...r, ordemExibicao: i } });
  }

  // Elegibilidade por país
  const paisesElegiveis = [
    { oportunidadeId: ID.oportunidade1, codigoPais: "AO", tipoCriterio: "NACIONALIDADE" as const, resultado: "ELEGIVEL" as const, observacoes: "Dado fictício de demonstração" },
    { oportunidadeId: ID.oportunidade2, codigoPais: "AO", tipoCriterio: "NACIONALIDADE" as const, resultado: "POR_CONFIRMAR" as const, observacoes: "Dado fictício de demonstração" },
    { oportunidadeId: ID.oportunidade3, codigoPais: "AO", tipoCriterio: "NACIONALIDADE" as const, resultado: "NAO_ELEGIVEL" as const, observacoes: "Demonstração: serve para testar este estado" },
    { oportunidadeId: ID.oportunidade4, codigoPais: "AO", tipoCriterio: "NACIONALIDADE" as const, resultado: "POR_CONFIRMAR" as const, observacoes: "Dado fictício de demonstração" },
    { oportunidadeId: ID.oportunidade5, codigoPais: "AO", tipoCriterio: "NACIONALIDADE" as const, resultado: "ELEGIVEL" as const, observacoes: "Dado fictício de demonstração" },
  ];
  for (const p of paisesElegiveis) {
    await prisma.elegibilidadePais.upsert({
      where: {
        oportunidadeId_codigoPais_tipoCriterio: {
          oportunidadeId: p.oportunidadeId,
          codigoPais: p.codigoPais,
          tipoCriterio: p.tipoCriterio,
        },
      },
      update: p,
      create: p,
    });
  }

  // Documentos exigidos (sem ID fixo: limpa e recria por oportunidade)
  await prisma.documentoExigido.deleteMany({
    where: { oportunidadeId: { in: oportunidades.map((o) => o.id) } },
  });
  const documentos = [
    { oportunidadeId: ID.oportunidade1, nome: "Certificado de Licenciatura", descricao: "Diploma e classificações.", obrigatorio: true, estadoConfirmacao: "CONFIRMADA" as const, urlFonte: URL_DEMO },
    { oportunidadeId: ID.oportunidade1, nome: "Carta de Motivação", descricao: "Até 2 páginas.", obrigatorio: true, estadoConfirmacao: "CONFIRMADA" as const, urlFonte: URL_DEMO },
    { oportunidadeId: ID.oportunidade2, nome: "Documento de Identificação", descricao: "Passaporte ou BI.", obrigatorio: true, estadoConfirmacao: "CONFIRMADA" as const, urlFonte: URL_DEMO },
    { oportunidadeId: ID.oportunidade3, nome: "Comprovativo de Inscrição", descricao: "Declaração da instituição de origem.", obrigatorio: true, estadoConfirmacao: "POR_CONFIRMAR" as const, urlFonte: URL_DEMO },
    { oportunidadeId: ID.oportunidade5, nome: "Certificado de Notas", descricao: "Histórico académico.", obrigatorio: true, estadoConfirmacao: "CONFIRMADA" as const, urlFonte: URL_DEMO },
    { oportunidadeId: ID.oportunidade6, nome: "Curriculum Vitae", descricao: "CV atualizado.", obrigatorio: true, estadoConfirmacao: "POR_CONFIRMAR" as const, urlFonte: URL_DEMO },
  ];
  for (const d of documentos) {
    await prisma.documentoExigido.create({ data: d });
  }

  // Verificações editoriais (sem ID fixo: limpa e recria por oportunidade).
  // Coerência: PUBLICADA => VERIFICADA; PENDENTE => PENDENTE.
  await prisma.verificacaoOportunidade.deleteMany({
    where: { oportunidadeId: { in: oportunidades.map((o) => o.id) } },
  });
  const verificacoes = [
    { oportunidadeId: ID.oportunidade1, estado: "VERIFICADA" as const, verificadaEm: daqui(-2), notas: "Verificação fictícia de demonstração" },
    { oportunidadeId: ID.oportunidade2, estado: "VERIFICADA" as const, verificadaEm: daqui(-1), notas: "Verificação fictícia de demonstração" },
    { oportunidadeId: ID.oportunidade3, estado: "VERIFICADA" as const, verificadaEm: daqui(-3), notas: "Verificação fictícia de demonstração" },
    { oportunidadeId: ID.oportunidade4, estado: "VERIFICADA" as const, verificadaEm: daqui(-4), notas: "Verificação fictícia de demonstração" },
    { oportunidadeId: ID.oportunidade5, estado: "VERIFICADA" as const, verificadaEm: daqui(-6), notas: "Verificação fictícia de demonstração" },
    { oportunidadeId: ID.oportunidade6, estado: "PENDENTE" as const, verificadaEm: null, notas: null },
  ];
  for (const v of verificacoes) {
    await prisma.verificacaoOportunidade.create({
      data: { ...v, urlConsultada: URL_DEMO, administradorId: ID.admin },
    });
  }

  // ---------------------------------------------------- FAVORITOS E CANDIDATURAS
  const favoritos: Array<[string, string]> = [
    [ID.candidato1, ID.oportunidade1],
    [ID.candidato1, ID.oportunidade4],
    [ID.candidato2, ID.oportunidade3],
  ];
  for (const [utilizadorId, oportunidadeId] of favoritos) {
    await prisma.favorito.upsert({
      where: { utilizadorId_oportunidadeId: { utilizadorId, oportunidadeId } },
      update: {},
      create: { utilizadorId, oportunidadeId },
    });
  }

  const candidaturas = [
    {
      id: ID.candidatura1,
      utilizadorId: ID.candidato1,
      oportunidadeId: ID.oportunidade1,
      estado: "EM_PREPARACAO" as const,
      notasPrivadas: "Falta a carta de motivação.",
      dataSubmissaoExterna: null,
    },
    {
      id: ID.candidatura2,
      utilizadorId: ID.candidato2,
      oportunidadeId: ID.oportunidade2,
      estado: "SUBMETIDA_EXTERNAMENTE" as const,
      notasPrivadas: "Submetida no portal externo de demonstração.",
      dataSubmissaoExterna: daqui(-4),
    },
  ];
  for (const c of candidaturas) {
    await prisma.candidatura.upsert({ where: { id: c.id }, update: c, create: c });
  }

  // Histórico coerente com os estados acima (sem ID fixo: limpa e recria)
  await prisma.historicoCandidatura.deleteMany({
    where: { candidaturaId: { in: candidaturas.map((c) => c.id) } },
  });
  const historicos = [
    { candidaturaId: ID.candidatura1, estadoAnterior: null, estadoNovo: "PLANEADA" as const, observacao: "Candidatura criada.", alteradoPorId: ID.candidato1 },
    { candidaturaId: ID.candidatura1, estadoAnterior: "PLANEADA" as const, estadoNovo: "EM_PREPARACAO" as const, observacao: "A reunir documentos.", alteradoPorId: ID.candidato1 },
    { candidaturaId: ID.candidatura2, estadoAnterior: null, estadoNovo: "PLANEADA" as const, observacao: "Candidatura criada.", alteradoPorId: ID.candidato2 },
    { candidaturaId: ID.candidatura2, estadoAnterior: "PLANEADA" as const, estadoNovo: "SUBMETIDA_EXTERNAMENTE" as const, observacao: "Submetida no portal externo.", alteradoPorId: ID.candidato2 },
  ];
  for (const h of historicos) {
    await prisma.historicoCandidatura.create({ data: h });
  }

  // ------------------------------------------------------------------- MENTORIA
  // Só mentores verificados têm serviços: o mentor 3 está PENDENTE e não vende.
  const mentores = [
    {
      id: ID.mentor1,
      utilizadorId: ID.mentorUser1,
      biografia: "Mentor de demonstração com experiência em candidaturas a mestrados.",
      especialidades: ["Engenharia de Software", "Mestrados", "Cartas de motivação"],
      estadoVerificacao: "VERIFICADA" as const,
    },
    {
      id: ID.mentor2,
      utilizadorId: ID.mentorUser2,
      biografia: "Mentora de demonstração especializada em entrevistas e bolsas.",
      especialidades: ["Gestão", "Entrevistas", "Bolsas"],
      estadoVerificacao: "VERIFICADA" as const,
    },
    {
      id: ID.mentor3,
      utilizadorId: ID.mentorUser3,
      biografia: "Mentor de demonstração ainda em processo de verificação (não tem serviços).",
      especialidades: ["Escolha de Universidade", "Investigação"],
      estadoVerificacao: "PENDENTE" as const,
    },
  ];
  for (const m of mentores) {
    await prisma.mentor.upsert({ where: { id: m.id }, update: m, create: m });
  }

  const servicos = [
    {
      id: ID.servicoGeral1,
      mentorId: null,
      tipo: "GERAL" as const,
      titulo: "Mentoria Geral - Preparação de Candidaturas",
      descricao: "Acesso a conteúdos interativos e assistente de IA para preparar candidaturas. Sem sessão ao vivo.",
      duracaoMinutos: null,
      validadeDias: 30,
      preco: 5000,
      moeda: "AOA",
      ativo: true,
    },
    {
      id: ID.servicoGeral2,
      mentorId: null,
      tipo: "GERAL" as const,
      titulo: "Mentoria Geral - Guia de Bolsas",
      descricao: "Conteúdos guiados e assistente de IA sobre bolsas. Sem sessão ao vivo.",
      duracaoMinutos: null,
      validadeDias: 60,
      preco: 7500,
      moeda: "AOA",
      ativo: true,
    },
    {
      id: ID.servicoPersonalizado1,
      mentorId: ID.mentor1,
      tipo: "PERSONALIZADA" as const,
      titulo: "Sessão Individual - Revisão de Candidatura",
      descricao: "Sessão de 60 minutos com mentor para revisão da candidatura, com link de videocall.",
      duracaoMinutos: 60,
      validadeDias: null,
      preco: 15000,
      moeda: "AOA",
      ativo: true,
    },
    {
      id: ID.servicoPersonalizado2,
      mentorId: ID.mentor2,
      tipo: "PERSONALIZADA" as const,
      titulo: "Sessão Individual - Preparação de Entrevista",
      descricao: "Sessão de 45 minutos com simulação de entrevista, com link de videocall.",
      duracaoMinutos: 45,
      validadeDias: null,
      preco: 12000,
      moeda: "AOA",
      ativo: true,
    },
  ];
  for (const s of servicos) {
    await prisma.servicoMentoria.upsert({ where: { id: s.id }, update: s, create: s });
  }

  // ------------------------------------------------------------------ AGENDAMENTOS
  // Datas relativas e em dias diferentes por mentor (respeita a restrição EXCLUDE).
  // fim = início + duração do serviço.
  const agendamentos = [
    {
      id: ID.agendamento1,
      servicoId: ID.servicoPersonalizado1,
      mentorId: ID.mentor1,
      candidatoId: ID.candidato1,
      inicio: daquiAs(10, 10, 0),
      fim: daquiAs(10, 11, 0),
      estado: "CONFIRMADO" as const,
      expiraEm: null,
      linkReuniao: "https://example.org/demo-reuniao",
      eventoExternoId: "demo-evento-0001",
      motivoCancelamento: null,
    },
    {
      id: ID.agendamento2,
      servicoId: ID.servicoPersonalizado2,
      mentorId: ID.mentor2,
      candidatoId: ID.candidato2,
      inicio: daquiAs(11, 14, 0),
      fim: daquiAs(11, 14, 45),
      estado: "PENDENTE_PAGAMENTO" as const,
      expiraEm: daqui(1),
      linkReuniao: null,
      eventoExternoId: null,
      motivoCancelamento: null,
    },
  ];
  for (const a of agendamentos) {
    await prisma.agendamentoMentoria.upsert({ where: { id: a.id }, update: a, create: a });
  }

  // ------------------------------------------------------------------- PAGAMENTOS
  const pagamentos = [
    {
      id: ID.pagamento1,
      utilizadorId: ID.candidato1,
      servicoId: ID.servicoPersonalizado1,
      agendamentoId: ID.agendamento1,
      fornecedor: "SIMULADO",
      referenciaExterna: "SIM-2026-0001",
      valor: 15000,
      moeda: "AOA",
      estado: "CONFIRMADO" as const,
      confirmadoEm: daqui(-1),
    },
    {
      id: ID.pagamento2,
      utilizadorId: ID.candidato2,
      servicoId: ID.servicoPersonalizado2,
      agendamentoId: ID.agendamento2,
      fornecedor: "SIMULADO",
      referenciaExterna: "SIM-2026-0002",
      valor: 12000,
      moeda: "AOA",
      estado: "PENDENTE" as const,
      confirmadoEm: null,
    },
    {
      id: ID.pagamento3,
      utilizadorId: ID.candidato1,
      servicoId: ID.servicoGeral1,
      agendamentoId: null,
      fornecedor: "SIMULADO",
      referenciaExterna: "SIM-2026-0003",
      valor: 5000,
      moeda: "AOA",
      estado: "CONFIRMADO" as const,
      confirmadoEm: daqui(-2),
    },
  ];
  for (const p of pagamentos) {
    await prisma.pagamento.upsert({ where: { id: p.id }, update: p, create: p });
  }

  // --------------------------------------------------------------- EVENTOS (WEBHOOK)
  const eventos = [
    {
      id: ID.evento1,
      fornecedor: "SIMULADO",
      eventoExternoId: "evt_sim_0001",
      tipo: "pagamento.confirmado",
      pagamentoId: ID.pagamento1,
      payload: { evento: "pagamento.confirmado", referencia: "SIM-2026-0001", valor: 15000, moeda: "AOA", demo: true },
      processadoEm: daqui(-1),
    },
    {
      id: ID.evento2,
      fornecedor: "SIMULADO",
      eventoExternoId: "evt_sim_0003",
      tipo: "pagamento.confirmado",
      pagamentoId: ID.pagamento3,
      payload: { evento: "pagamento.confirmado", referencia: "SIM-2026-0003", valor: 5000, moeda: "AOA", demo: true },
      processadoEm: daqui(-2),
    },
  ];
  for (const e of eventos) {
    await prisma.eventoPagamento.upsert({ where: { id: e.id }, update: e, create: e });
  }

  // ------------------------------------------------------------------- ACESSOS
  const acessos = [
    {
      id: ID.acesso1,
      utilizadorId: ID.candidato1,
      servicoId: ID.servicoGeral1,
      pagamentoId: ID.pagamento3,
      estado: "ATIVO" as const,
      inicioEm: daqui(-2),
      expiraEm: daqui(28),
    },
  ];
  for (const a of acessos) {
    await prisma.acessoServico.upsert({ where: { id: a.id }, update: a, create: a });
  }

  // --------------------------------------------------------------- IA (CHAT)
  await prisma.conversaIA.upsert({
    where: { id: ID.conversa1 },
    update: {
      utilizadorId: ID.candidato1,
      acessoId: ID.acesso1,
      titulo: "Dúvidas sobre a bolsa universitária de exemplo",
    },
    create: {
      id: ID.conversa1,
      utilizadorId: ID.candidato1,
      acessoId: ID.acesso1,
      titulo: "Dúvidas sobre a bolsa universitária de exemplo",
    },
  });

  const mensagens = [
    {
      id: ID.mensagem1,
      conversaId: ID.conversa1,
      papel: "UTILIZADOR" as const,
      conteudo: "A bolsa universitária de exemplo pede que média mínima?",
    },
    {
      id: ID.mensagem2,
      conversaId: ID.conversa1,
      papel: "ASSISTENTE" as const,
      conteudo:
        "Segundo o catálogo (dados de demonstração), esta oportunidade pede média mínima de 14 valores, mas esse requisito ainda está por confirmar. Não consegui confirmar o resto; consulta a fonte oficial.",
    },
  ];
  for (const m of mensagens) {
    await prisma.mensagemIA.upsert({ where: { id: m.id }, update: m, create: m });
  }

  console.log("Dados de demonstração criados com sucesso.");
  console.log("Contas de demonstração (palavra-passe definida no backend/.env):");
  for (const c of contas) {
    console.log(`  - ${c.papel.padEnd(9)} ${c.email}`);
  }
}

main()
  .catch((erro) => {
    console.error("Falha ao semear a base de dados:", erro);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
