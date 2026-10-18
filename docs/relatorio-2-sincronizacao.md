# Relatório 2 — Sincronização da equipa Bolsa360

**Quem escreveu:** Adia (Backend/Base de dados)
**Data:** outubro de 2026
**Branch:** `adianeth-branch`
**Âmbito:** ponto de situação geral e alinhamento entre as quatro pessoas

Este é o relatório de sincronização da equipa. Não é uma repetição do relatório de mentoria e
pagamentos: esse continua a ser o sítio onde explico a fundo o modelo de dados e o fluxo do P2.
Aqui faço o ponto geral, explico o que cada um tem de fazer para pôr isto a correr, e deixo as
observações que interessam ao Dillan (API) e à Michele e ao José (frontend e integração).
Escrevo na primeira pessoa, em nome do backend e da base de dados, e comparo o que temos com o
que o documento de engenharia de software pede. Li o documento antes de escrever isto — consegui
extrair o texto do PDF — e confirmei os factos no repositório.

---

## 1. Ponto de situação

O que está **feito e confirmado**:

O schema Prisma tem **23 tabelas de domínio**. Contei 23 modelos no `backend/prisma/schema.prisma`,
que correspondem às 23 tabelas de domínio, mais a tabela interna `_prisma_migrations` (a do
controlo de migrações do Prisma, que nunca se toca): no total são 24 objetos no schema `public`.
As 23 são: utilizadores e perfis; os catálogos (tipos de oportunidade, níveis de ensino,
categorias de estudo); as oportunidades e tudo o que gravita à volta delas (categorias, regras de
elegibilidade, elegibilidade por país, documentos exigidos, verificações); favoritos; candidaturas
e histórico; registos de auditoria; e o bloco novo de mentoria e pagamentos (mentores, serviços,
agendamentos, pagamentos, eventos de pagamento, acessos a serviços, conversas de IA e mensagens
de IA).

Estão aplicadas **5 migrações**, por ordem: `20261018010141_init_mvp`, `20261018012056_mentoria`,
`20261018013813_mentoria_pagamentos` (esta está vazia — explico porquê no relatório 1 e repito na
secção 7), `20261018020737_mentoria_agendamento_acessos` e `20261018021000_regras_integridade`.

As **regras de integridade estão em SQL** dentro da migração `regras_integridade`: o índice parcial
único `candidaturas_ativa_unica` (uma candidatura ativa por utilizador e oportunidade, RF-24) e a
restrição de exclusão `agendamento_sem_sobreposicao` (um mentor não pode ter dois horários
sobrepostos, usando `btree_gist`).

O **seed de demonstração** está completo em `backend/prisma/seed.ts`, com dados claramente
marcados como fictícios e idempotente (usa `upsert` com IDs fixos, por isso pode correr várias
vezes sem duplicar).

O **relatório 1** está em `docs/relatorio-mentoria-pagamentos.md` e cobre a fundo a mentoria e os
pagamentos.

Escrevi também a **primeira versão da consulta do catálogo público**, que é o arranque do dia
17/10. Está em `backend/src/modules/oportunidades/oportunidades.repository.ts` e testei-a contra a
base `bolsa360_dev` com um script auxiliar (`backend/scripts/experimentar-catalogo.ts`). Filtra
tudo no servidor e devolve as oportunidades já no formato `data` + `meta` do contrato. Explico-a
com detalhe na secção 5.

**Estado do Git:** o push da `adianeth-branch` foi feito até ao commit
`aab2f8e6af7038f55973b4315a6295b336da8715` ("docs: relatorio de mentoria e pagamentos"). Desde
aí tenho commits por enviar: o `47a84c3` ("docs: relatorio 2 de sincronizacao da equipa"), o
`5132db3` ("feat(db): consulta do catalogo de oportunidades publicas") e o commit desta própria
atualização do relatório. Ainda não abri o pull request para a `main`.

O que **ainda está por fazer**, com honestidade, face ao cronograma do documento (secção 15):

- **Catálogo (17/10)** — a primeira versão da consulta já está feita e testada; falta a parte dos
  **índices** (pesquisa por texto e um índice composto de estado editorial e prazo) e o **endpoint
  de detalhe** (`GET /oportunidades/:id`).
- **Persistência de perfil e favoritos** — previsto para 18/10. Ainda não está.
- **Candidaturas, restrições únicas e histórico** — previsto para 19/10. A estrutura da base de
  dados já existe (tabelas, índice parcial e histórico), mas o código que a usa ainda não.

Ou seja, continuamos um pouco atrasados relativamente ao plano, mas não é dramático: o alicerce —
schema, migrações, integridade e seed — está pronto e sólido, e a consulta do catálogo já cobre a
parte de que o Dillan e a Michele precisam para começar a ligar as suas partes a dados a sério.
Falta fechar os índices e a função de detalhe, e depois seguir para perfil e favoritos.

## 2. Como pôr o projeto a funcionar na tua máquina

Passo a passo, depois de estares na branch certa:

1. Faz `git pull` da branch `adianeth-branch` (nome todo em minúsculas).
2. Entra na pasta `backend/`.
3. Corre `npm install`. Atenção: apareceu uma dependência nova, o `argon2`, que é um módulo
   nativo; se der erro de compilação, avisa-me.
4. Cria o teu `backend/.env` a partir do modelo `backend/.env.example`, copiando-o e preenchendo os
   valores. O `.env` **nunca** vai para o Git — está em ambos os `.gitignore` (o da raiz e o do
   `backend/`), e o `.env.example` é a única exceção que fica versionada.
5. Garante que existe uma base de dados local chamada `bolsa360_dev` no teu PostgreSQL, e que o
   `DATABASE_URL` do teu `.env` aponta para ela. Se ainda não existir, cria-a vazia; não precisas
   de criar tabelas à mão.
6. Corre `npx prisma migrate dev`. Isto aplica as cinco migrações, incluindo o SQL manual da
   restrição anti-sobreposição e o índice parcial das candidaturas.
7. Corre `npm run db:seed` para teres os dados de demonstração.

Depois disto tens também `npm run db:studio` (ver os dados numa interface), `npm run db:migrate`
(novas migrações) e `npm run db:reset` (apagar tudo e começar do zero).

Cada pessoa usa a **sua** base de dados local e o **seu** `.env`. Não reutilizem nem partilhem
bases de dados — isso mistura dados e estraga o trabalho dos outros.

## 3. Contas e palavras-passe de demonstração

As palavras-passe **não estão no código nem no repositório**. Vêm de duas variáveis do `.env` de
cada pessoa: `SEED_ADMIN_PASSWORD` e `SEED_DEMO_PASSWORD` (o `.env.example` mostra onde). Eu
combino os valores com cada um em privado — nunca por aqui nem em mensagens do repositório.

As contas que o seed cria, com o email e o papel (li-os diretamente do `seed.ts`):

- `admin@example.org` — **ADMIN**
- `ana.demo@example.org` — CANDIDATO
- `bruno.demo@example.org` — CANDIDATO
- `carla.demo@example.org` — CANDIDATO
- `daniel.demo@example.org` — MENTOR (verificado)
- `elsa.demo@example.org` — MENTOR (verificado)
- `filipe.demo@example.org` — MENTOR (em processo de verificação, sem serviços associados)

O hash das palavras-passe é **Argon2id**, gravado no formato habitual do `argon2`. Isto tem uma
consequência prática para o Dillan: o **login tem de usar a mesma biblioteca** (`argon2`, o pacote
`npm argon2`), senão os hashes do seed não são reconhecidos e as contas de demonstração não
entram. Isto está combinado do meu lado, mas **por confirmar** do lado dele — na branch
`origin/Dillan/Backend` ainda só existem `src/app.ts` e `src/server.ts`, sem autenticação.

Estas contas são **só para a base de dados local**. O seed recusa correr quando
`NODE_ENV=production`, para ninguém o apontar a uma base partilhada ou online.

## 4. Dados de demonstração

Todas as oportunidades começam por `[DEMO]` no título, pertencem a entidades fictícias (Fundação
Exemplo A a E, Instituto Exemplo B/C/D e Empresa Exemplo F) e os links apontam para `example.org`,
que é um domínio reservado para exemplos. Nada ali é uma oportunidade real. São seis
oportunidades, escolhidas para cobrirem os casos que interessam:

- **Aberto** — uma bolsa universitária integral, aberta há 30 dias, com prazo a 60 dias.
- **Prazo próximo** — um curso de língua com prazo a 5 dias, para se ver o aviso de prazo a
  aproximar-se.
- **Futuro** — um intercâmbio que só abre daqui a 20 dias.
- **Sem prazo confirmado** — uma formação técnica sem datas divulgadas (abertura e prazo a nulo).
- **Expirado** — uma bolsa de mérito já encerrada, com prazo há 10 dias.
- **Em revisão editorial** — um estágio com estado `PENDENTE`, que **não** aparece no catálogo
  público.

Complementam isto 12 tipos de oportunidade, 6 níveis de ensino e 9 categorias de estudo, todos
conforme a secção 11.1 do documento.

As **datas são relativas ao dia em que corres o seed** (uso um auxiliar que soma dias a hoje). A
consequência é importante: se correres isto hoje e ensaiares a demonstração para a semana, os
prazos já mexeram. Por isso, **corre `npm run db:seed` antes de cada ensaio e antes da
demonstração**, para os quatro estados de prazo voltarem a ficar corretos.

## 5. Observações para o Dillan (API)

- **Email normalizado antes de gravar.** A unicidade na base de dados é exata (a coluna é
  `@unique`); se não normalizares (por exemplo, para minúsculas), vais deixar entrar duplicados que
  deviam ser o mesmo utilizador, e a restrição não te salva.
- **Só `PUBLICADA` no catálogo público.** A lista pública devolve apenas oportunidades com estado
  editorial `PUBLICADA` (RN-01); é isso que faz a oportunidade em revisão do seed não aparecer.
- **Elegibilidade e prazo calculam-se, não se guardam.** A elegibilidade para angolanos
  (`ELEGIVEL`/`NAO_ELEGIVEL`/`POR_CONFIRMAR`) e o estado do prazo
  (`FUTURO`/`ABERTO`/`EXPIRADO`/`SEM_PRAZO_CONFIRMADO`) são derivados das datas e das regras. Não
  os guardes como colunas; a RN-04 diz explicitamente que elegibilidade, verificação editorial e
  prazo são conceitos distintos.
- **Campos `Decimal`.** `valorFinanciamento`, os valores das regras de elegibilidade, `preco` dos
  serviços e `valor` dos pagamentos são `Decimal` (não `Float`), para não haver erros de
  arredondamento com dinheiro. Decide uma forma única de os serializar na resposta (recomendo
  string) e usa-a em todos os endpoints.
- **Histórico na mesma transação.** Quando mudares o estado de uma candidatura, grava o registo no
  histórico de candidatura **na mesma transação** que altera o estado. Se fizeres isto em dois
  passos, ficas com histórico e estado a divergir.
- **Duplicados e sobreposição são rejeitados pela base de dados.** Uma segunda candidatura ativa à
  mesma oportunidade é travada pelo índice `candidaturas_ativa_unica`, e dois horários sobrepostos
  do mesmo mentor pela restrição `agendamento_sem_sobreposicao`. Isto aparece como erro do Prisma
  (violação de unicidade/exclusão). Mapeia ambos para **409 Conflict** e **testa os dois casos** —
  o do índice é o mais fácil de esquecer.
- **Regras de pagamento.** Aplica tudo o que está no relatório 1, mas resumindo o essencial: só o
  servidor confirma um pagamento, nunca o cliente (RN-11); o preço vem sempre recalculado da base
  de dados; o webhook tem de ser público, validar a assinatura e receber o **corpo cru**
  (`express.raw`); a idempotência é garantida pela tabela `eventos_pagamento`, com chave única por
  fornecedor e identificador externo; a confirmação do pagamento e do agendamento vai numa
  transação; e o link da reunião só é criado **depois** de o pagamento estar `CONFIRMADO`.
- **Mentoria geral só para serviços `GERAL`.** Ao criar um acesso ou uma conversa de IA, confirma
  que o tipo do serviço é `GERAL`. A base de dados não impõe isto sozinha, por isso tem de ficar no
  teu código.
- **Chat de IA.** A chave da API fica **só no backend** (no `.env`), nunca no frontend. Em cada
  mensagem verifica, por esta ordem: sessão válida, dono da conversa, e acesso ao serviço ativo com
  expiração no futuro. Mete também um limite por utilizador (rate limit mais teto diário).
- **Mentores só vendem se estiverem verificados.** Um serviço de um mentor com estado
  `PENDENTE` não deve poder ser comprado nem agendado.
- **`package.json` e `tsconfig.json`.** Provavelmente vais ter conflito com os teus. A minha
  sugestão é manteres as tuas dependências e juntares estas: `prisma` e `@prisma/client` em
  `^6.19.3`, mais `dotenv`, `argon2`, `tsx` e `typescript`. Sobre a versão do Prisma: está no
  **major 6** — não a atualizes para já, para todos ficarmos alinhados.
- Uma nota de ambiente (não é código): o VSCode queixava-se de `process` e de `node:crypto` no
  `seed.ts`, e resolveu-se com um `tsconfig.json` no `backend/`. Como tu já tens um, depois vemos
  se acrescentas `prisma/**/*.ts` ao teu em vez de mantermos dois.

### A consulta do catálogo já está escrita

Está em `backend/src/modules/oportunidades/oportunidades.repository.ts` e encaixa no módulo
`oportunidades` que o documento descreve na secção 12 (routes, controller, service, repository e
schema): este ficheiro é o **repository**. Exporta `listarOportunidadesPublicas(prisma, filtros)`,
mais `construirWhere` e `calcularEstadoPrazo`, e os tipos `FiltrosOportunidades` e `EstadoPrazo`.

Como a usas: o **serviço** valida os parâmetros da query com Zod, converte-os para
`FiltrosOportunidades` e chama `listarOportunidadesPublicas(prisma, filtros)`. A função recebe o
cliente Prisma como parâmetro, precisamente para a poderes reutilizar e para os testes poderem
apontar a uma base separada.

Os filtros e os valores possíveis: `q` (texto; procura no título e na entidade financiadora, sem
distinguir maiúsculas de minúsculas); `tipo` (código, por exemplo `BOLSA_UNIVERSITARIA`); `nivel`
(código, por exemplo `MESTRADO`); `categoria` (slug, por exemplo `engenharia`); `paisDestino` (duas
letras, por exemplo `PT`); `financiamento` (valores do enum `TipoFinanciamento`: `INTEGRAL`,
`PARCIAL`, `PROPINA`, `ESTIPENDIO`, `CURSO_GRATUITO`, `OUTRO`); `elegibilidadeAngolanos`
(`ELEGIVEL`, `NAO_ELEGIVEL`, `POR_CONFIRMAR`); `estadoPrazo` (`FUTURO`, `ABERTO`, `EXPIRADO`,
`SEM_PRAZO_CONFIRMADO`); `ordenar` (`prazo` ou `recentes`); e `pagina` e `limite` (teto de 50, por
defeito 10). Parâmetros inválidos devem dar **400**.

O controller não deve conter regras: a paginação e o formato `data` + `meta` (`pagina`, `limite`,
`total`) já vêm resolvidos daqui. Os `Decimal` saem como texto no JSON (por exemplo `"12000"`) e as
datas em formato ISO.

Testei contra a `bolsa360_dev`: com `estadoPrazo: 'ABERTO'` devolveu 2 oportunidades (a bolsa
universitária aberta e o curso de língua). A oportunidade `PENDENTE` do seed **não** aparece — é
exatamente para isso que ela serve, para testares que o catálogo público não a mostra.

O **endpoint de detalhe** (`GET /oportunidades/:id`) ainda não existe: vai precisar de uma função
própria, a adicionar por mim, com as regras de elegibilidade, os documentos exigidos e a fonte
oficial. Quando a escrever, aviso-te.

## 6. Observações para a Michele e o José (frontend e integração)

- **O frontend nunca liga à base de dados.** Nada de `DATABASE_URL` nem de acesso direto ao
  PostgreSQL no frontend. Falam só com a API, com o prefixo `/api/v1` (secção 13 do documento).
- **Enquanto os endpoints não existem**, usem dados fictícios, mas no **formato do contrato**: o
  documento mostra a resposta com um campo `data` (lista de oportunidades) e um campo `meta`
  (paginação, com `pagina`, `limite` e `total`). Se mexerem nesse formato depois, é retrabalho para
  todos.
- **O que a API vai devolver por oportunidade.** Quando os endpoints existirem, cada oportunidade
  do catálogo traz: `id`, título, entidade financiadora, tipo, nível, país de destino, modalidade,
  tipo e valor de financiamento, moeda, datas de abertura e prazo, fonte oficial, data da última
  verificação, `estadoPrazo` e `elegibilidadeAngolanos`. Montem os filtros do frontend a partir
  desta lista (os mesmos que a consulta aceita, na secção 5), e usem dados fictícios exatamente
  neste formato até os endpoints existirem.
- **Nunca mostrar "elegível" quando o estado é `POR_CONFIRMAR`.** Isto é a RN-03 e a RN-17: se a
  fonte não confirma, mostramos "por confirmar", nunca inventamos. A compatibilidade do candidato é
  "preliminar" e explicável, não uma decisão oficial (secção 11.4). E usem o `estadoPrazo` que o
  servidor calcula — **não o recalculam** no frontend, para não haver duas verdades sobre o mesmo
  prazo.
- **Mostrar a fonte oficial e a data da última verificação.** Cada oportunidade tem
  `urlFonteOficial` e `ultimaVerificacaoEm` — são para aparecer (RN-02).
- **Os estados de prazo e a oportunidade expirada continuam visíveis.** Uma oportunidade expirada
  não desaparece do catálogo; fica marcada como expirada (RN-05). O histórico não se apaga.
- **Papéis e autorização.** Os papéis são `CANDIDATO`, `MENTOR` e `ADMIN`. Esconder um botão no
  frontend **não é** autorização — a decisão é sempre do servidor (RN-06, RN-07, RN-08). O
  frontend só reflete o que o servidor permite.
- **Depois de um pagamento, o frontend não decide nada.** Não marca nada como pago; pergunta ao
  servidor pelo estado do agendamento e mostra o que o servidor responder (RN-11).
- **O chat de IA só aparece a quem tem acesso**, mas a verificação real (sessão, dono, acesso
  ativo) é no backend (RNF-04). Esconder no frontend é só estética.

## 7. Regras para não partirmos a base de dados

- **Uma migração já aplicada nunca se edita.** Se estiver errada, faz-se uma migração nova a
  corrigir. Isto vale também para a migração `20261018013813_mentoria_pagamentos`, que está
  **vazia** (nasceu antes de o schema estar pronto e ficou sem SQL). É inofensiva, já está no
  GitHub, e não se apaga nem se edita.
- **Alterações ao schema passam por mim ou por pull request.** Um campo novo tem de vir com SQL
  versionado; se cada pessoa alterar o seu modelo, acabamos com bases diferentes.
- **As migrações vão sempre no commit.** Sem elas, quem fizer `git pull` fica com uma base
  desatualizada e não consegue reproduzir nada.
- **O `.env` nunca vai para o Git.** Está no `.gitignore` da raiz e no do backend.
- **O nome correto da branch é `adianeth-branch`**, todo em minúsculas. Não existe nenhuma
  `Adianeth-branch` no remoto. Nota de Windows: nomes que só diferem na caixa das letras colidem
  no disco local, por isso usem sempre minúsculas e confirmem com
  `git ls-remote --heads origin`, que é o que vale.
- **Não reutilizar nem partilhar bases de dados** entre pessoas.

## 8. Próximos passos (18/10 a 25/10), alinhados com o documento

Aqui vai o que o cronograma da secção 15 prevê, a começar em hoje, 18/10, e os marcos da secção 16.
Lembro que 17/10 já passou: desse dia já está feita a primeira versão da consulta do catálogo, e
falta-me fechar os índices e a função de detalhe.

**18/10** — Adia: acabar os índices do catálogo e a função de detalhe, e depois a persistência de
perfil e favoritos. Dillan: rotas protegidas e propriedade dos recursos. Michele: detalhes, cartões
e responsividade. José: perfil e favoritos integrados.

**19/10** — Adia: candidaturas, restrições únicas e histórico. Dillan: endpoints e transições de
estado. Michele: estados visuais. José: painel de candidaturas.
Marco do dia: **Núcleo do candidato** (bolsas, perfil, favoritos e candidaturas persistem).

**20/10** — Adia: rever consistência, migrações e dados. Dillan: autorização `ADMIN` e rotas.
Michele: listas e detalhes de administração. José: formulários de criação e edição.

**21/10** — Adia: testes de persistência. Dillan: testes de API, permissões e erros. Michele:
interface, responsividade e acessibilidade. José: integração e sessão.
Marco do dia: **MVP integrado** (candidato e administrador executam os fluxos principais com
autorização).

**22/10** — Adia: integridade e duplicados. Dillan: acesso indevido, validações e rate limit.
Michele: formulários, estados vazios e erros. José: testes de interface e fluxos.

**23/10** — Adia: documentar schema, migrações e seed. Dillan: documentar API, configuração e
segurança. Michele: consistência visual. José: README, instalação e aceitação.
Marco do dia: **Versão documentada**.

**24/10 e 25/10** — Adia: instalação limpa e dados, depois integridade da base de dados. Dillan:
erros, permissões e execução da API. Michele: problemas visuais e interface na apresentação.
José: ensaio da demonstração, README e submissão.
Marco final: **Entrega** (versão testada, demonstração ensaiada e repositório executável).

E três notas que não quero deixar implícitas:

- A **mentoria e os pagamentos são P2** no documento (a secção 2.2 põe "pagamentos reais, agenda de
  mentores e videochamadas" em P2). Só avançam de forma séria depois de o **P0** — autenticação,
  catálogo, favoritos, candidaturas e administração — estar sólido. Não vale a pena puxar o P2 para
  a frente e deixar o P0 em risco.
- O **fornecedor de pagamentos será simulado** até haver conta real. O fluxo (webhook, assinatura,
  transação) é o mesmo; quando o fornecedor real entrar, é trocar uma peça.
- Ficam por decidir duas coisas: a **disponibilidade dos mentores** (ainda não está modelada) e se
  o **conteúdo da mentoria geral** fica fixo no frontend ou numa tabela da base de dados.

## 9. Pontos em aberto (para decidirmos esta semana)

- Confirmar com o Dillan que o login usa Argon2id (senão as contas do seed não entram).
- Enviar o commit do relatório 2 e a consulta do catálogo, abrir o pull request para a `main` e
  pedir revisão ao Dillan.
- Resolver o conflito de `package.json` e `tsconfig.json` com a branch do Dillan.
- Confirmar com o Dillan o formato dos erros **400** (parâmetros inválidos) e **409** (duplicados
  de candidatura e sobreposição de horários).
- Decidir se o PDF do documento e o `tsconfig.json` entram no repositório (neste momento estão
  fora do controlo de versões, por confirmar onde devem ficar).
- Decidir a disponibilidade dos mentores e onde guardar o conteúdo da mentoria geral.
