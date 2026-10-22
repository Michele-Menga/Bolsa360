# Relatório — Backend/API (Dillan)

**Período:** desde a primeira integração da base da Adia (`631e780`) até `5b817eb`.
**Branch:** `Dillan/Backend`.
**Âmbito:** API Node/Express + TypeScript, autenticação, catálogo, administração,
perfil, favoritos, candidaturas, testes e documentação.

---

## 1. Ponto de partida

O repositório tinha a estrutura base e o Prisma da Adia (schema, 5 migrações e seed),
mas do lado da API só existiam `src/app.ts` e `src/server.ts`, sem rotas, autenticação
nem acesso a dados. O trabalho consistiu em construir os módulos P0 por cima dessa base,
sem alterar `schema.prisma` nem migrações.

## 2. Ambiente e configuração

- **Node 20.20.2** via `fnm`. O Node 22 do sistema não era compatível com os binários
  nativos do `argon2`; por isso a versão foi fixada.
- **`argon2` 0.41.1** (a versão mais recente exigia C++ Build Tools no Windows).
- **Prisma / `@prisma/client` 6.19.3**, alinhados com o resto da equipa.
- Dependências novas: `jsonwebtoken`, `cookie-parser`, `cors`, `express-rate-limit`,
  `zod`; em desenvolvimento: `vitest`, `supertest`.
- **`.npmrc`** com `legacy-peer-deps=true` para contornar um bug do npm 10.8.2
  (`Cannot read properties of null (reading 'edgesOut')`) ao resolver os peers do Vitest.
- `.env` local com `DATABASE_URL`, `PORT`, `SESSION_SECRET` (≥32 caracteres),
  `FRONTEND_URL` e `SEED_ADMIN_PASSWORD` / `SEED_DEMO_PASSWORD`.
- BD local `bolsa360_dev` com as 5 migrações aplicadas e o seed idempotente executado.

## 3. O que foi implementado

### 3.1 Base transversal

- Configuração validada (`config/env.ts`) e cliente Prisma único (`config/database.ts`).
- `AppError` + middleware central de erros no formato `{ erro: { codigo, mensagem } }`.
- Middlewares `validateBody` / `validateQuery` / `validateParams` (Zod, guardam em
  `res.locals`), `authenticate`, `authorize`, `notFound` e rate limit.
- CORS com credenciais para `FRONTEND_URL` e `cookie-parser`.

### 3.2 Autenticação (`/api/v1/auth`)

- `POST /register` (cria `CANDIDATO`), `POST /login`, `POST /logout`, `GET /me`.
- Palavras-passe com **Argon2id** (compatível com os hashes do seed).
- Sessão em JWT dentro de cookie `bolsa360_sessao` (`HttpOnly`, `SameSite=Lax`,
  `Secure` em produção).
- Email normalizado antes de gravar; duplicados → `409 EMAIL_JA_EXISTE`.
- Rate limit de login: 10 falhas / 15 min por IP → `429 DEMASIADAS_TENTATIVAS`.

### 3.3 Catálogo público (`/api/v1/oportunidades`)

- `GET /` — só oportunidades `PUBLICADA`; paginação e filtros no servidor.
- `GET /:id` — detalhe com regras, documentos exigidos e elegibilidade por país;
  `404` para oportunidades não publicadas.
- `estadoPrazo` e `elegibilidadeAngolanos` são **calculados**, nunca guardados.
- `Decimal` sai sempre como **string** no JSON.

### 3.4 Administração (`/api/v1/admin/oportunidades`, papel `ADMIN`)

- Listar (inclui qualquer estado editorial), criar, obter, atualizar, publicar e arquivar.
- Criar força `RASCUNHO`.
- Publicar regista uma verificação `VERIFICADA` e `ultimaVerificacaoEm` na **mesma
  transação** que muda o estado.

### 3.5 Perfil (`/api/v1/perfis`, papel `CANDIDATO`)

- `GET /me` e `PUT /me` (upsert). `nacionalidadeCodigo` é obrigatório; o resto é
  opcional (`dataNascimento`, `nivelEnsinoAtualId`, `areaEstudo`, `instituicaoEnsino`,
  `paisDestinoPreferido`, `idiomas`).

### 3.6 Favoritos (`/api/v1/favoritos`)

- `GET /`, `POST /:oportunidadeId`, `DELETE /:oportunidadeId`.
- Operações idempotentes; `POST` só aceita oportunidades `PUBLICADA` (senão `404`).

### 3.7 Candidaturas (`/api/v1/candidaturas`)

- `GET /`, `POST /`, `GET /:id`, `PATCH /:id`, sempre limitado ao próprio utilizador
  (recurso de outro utilizador → `404`).
- Criar regista a entrada `PLANEADA` no histórico na **mesma transação**.
- Segundo candidatura ativa à mesma oportunidade → `409 CANDIDATURA_DUPLICADA`
  (apoiado no índice parcial `candidaturas_ativa_unica`).
- `PATCH` muda o estado e acrescenta ao histórico na mesma transação; ao entrar em
  `SUBMETIDA_EXTERNAMENTE` preenche `dataSubmissaoExterna`.

## 4. Contrato da API

Referência completa em **`docs/api/README.md`** (parâmetros, exemplos, códigos de erro).

Resumo dos endpoints:

| Método | Rota |
| --- | --- |
| POST | `/auth/register`, `/auth/login`, `/auth/logout` |
| GET | `/auth/me` |
| GET | `/oportunidades`, `/oportunidades/:id` |
| GET/POST | `/admin/oportunidades` |
| GET/PATCH | `/admin/oportunidades/:id` |
| POST | `/admin/oportunidades/:id/publicar`, `/:id/arquivar` |
| GET/PUT | `/perfis/me` |
| GET | `/favoritos` |
| POST/DELETE | `/favoritos/:oportunidadeId` |
| GET/POST | `/candidaturas` |
| GET/PATCH | `/candidaturas/:id` |
| GET | `/saude` |

## 5. Testes e qualidade

- **Vitest + Supertest**, 5 ficheiros, **35 testes** de integração.
- Cobrem: autenticação (registo, duplicado, credenciais, logout, validação),
  catálogo (lista, filtros, detalhe, 404, validação), perfil (404→upsert, validação,
  autorização), favoritos (idempotência, remoção, não publicada, 401) e candidaturas
  (duplicado `409`, histórico, transições, `dataSubmissaoExterna`, acesso cruzado `404`,
  401).
- Cada execução usa um **schema isolado** `bolsa360_test`: o setup global apaga o schema,
  aplica as migrações (`prisma migrate deploy`) e corre o seed. A BD de desenvolvimento
  não é tocada.
- Comando: `npm test` (com Node 20).
- `tsc --noEmit` sem erros.

## 6. Integração com a branch da Adia

A `adianeth-branch` avançou de `aab2f8e` para `4add5a5` com 4 commits: relatório 2,
script `scripts/experimentar-catalogo.ts` e uma primeira versão do
`oportunidades.repository.ts`.

Foi feito merge (`5b817eb`) e o conflito **add/add** no repository foi resolvido
**adotando a versão da Adia**. Para não perder o trabalho já feito:

- A consulta de detalhe foi movida para `oportunidades.detalhe.repository.ts`.
- O `service` passou a traduzir o query HTTP para os `FiltrosOportunidades` dela e
  continua a converter `Decimal` para string e a acrescentar `totalPaginas` ao `meta`.

**Mudança de contrato no catálogo** (importante para o frontend):

| Antes | Agora |
| --- | --- |
| `pesquisa` | `q` |
| `tipoOportunidadeId` (uuid) | `tipo` (código, ex.: `BOLSA_UNIVERSITARIA`) |
| `nivelEnsinoId` (uuid) | `nivel` (código, ex.: `MESTRADO`) |
| `categoriaSlug` | `categoria` (slug) |
| `paisDestinoCodigo` | `paisDestino` |
| `tipoFinanciamento` | `financiamento` |
| `modalidade` | **removido** (não existe no repository adotado) |
| — | `ordenar` (`prazo` por omissão, ou `recentes`) |

`pagina`, `limite`, `estadoPrazo` e `elegibilidadeAngolanos` mantêm-se.

## 7. Pontos a acertar com o frontend

- O campo é **`palavraPasse`** (não `palavra_passe`) no registo e no login.
- O `api.ts` atual lê `errorData.message`; a API devolve
  `errorData.erro.mensagem`. É preciso alinhar.
- O papel pode ser `ADMIN`, `CANDIDATO` ou `MENTOR`.
- Enviar sempre `credentials: "include"` (cookie de sessão).
- O catálogo passou a usar códigos (`tipo`, `nivel`) em vez de UUIDs; ver tabela acima.

## 8. Estado do Git

- Branch `Dillan/Backend` publicada em `origin` até `5b817eb`.
- Commits principais: `28f8634` (base + catálogo), `f66b2fb` (auth), `0bee510`
  (detalhe + administração), `ec82094` (perfil/favoritos/candidaturas), `fc8c0c4`
  (testes), `5b817eb` (merge da Adia).
- Entre `631e780` e `5b817eb`: 57 ficheiros, +6414 / −607 linhas.
- Nota: existem duas branches no remote que só diferem na capitalização —
  `Adianeth-branch` (= `main` antiga) e `adianeth-branch` (ativa). No Windows colidem
  no ref local.

## 9. Pendente / próximos passos

- Ligação do frontend à API (Michele/José) e alinhamento do contrato acima.
- Índices de pesquisa do catálogo (indicados pela Adia como pendentes).
- P2 — mentoria e pagamentos: agendamentos (mapear a exclusão de sobreposição para
  `409`), serviços, webhook de pagamento com corpo cru e idempotência, e chat de IA.
  Nada disto foi iniciado.
