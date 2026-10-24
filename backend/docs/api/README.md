# API Bolsa360 — contrato (v1)

Prefixo: `/api/v1`. Este documento foi escrito a partir do código (rotas, schemas Zod, services e `prisma/schema.prisma`), que é a fonte de verdade. Se algo aqui divergir do código, vale o código.

## Convenções

| Tema | Regra |
| --- | --- |
| Sucesso | `{ "data": ... }` ou, em listas paginadas, `{ "data": [...], "meta": { "pagina", "limite", "total", "totalPaginas" } }` |
| Ações sem corpo | `POST /auth/logout`, `POST/DELETE /favoritos/:id` devolvem `{ "ok": true }` (sem `data`) |
| Erro | `{ "erro": { "codigo": "CODIGO", "mensagem": "Texto em português" } }` |
| Sessão | Cookie `bolsa360_sessao` (JWT, 7 dias): `HttpOnly`, `SameSite=Lax`, `Secure` só quando `NODE_ENV=production`, `Path=/` |
| Datas | Colunas `DATE` (abertura, prazo) saem como ISO à meia-noite UTC (`2026-12-31T00:00:00.000Z`); o `timestamptz` sai em ISO completo |
| Dinheiro | `Decimal` sai como **string** (`"12000"`, `"3500.5"`); nunca como número |
| Corpo JSON | Schemas `strict`: campos desconhecidos dão 400 `VALIDACAO_INVALIDA` |
| Papéis | `CANDIDATO`, `ADMIN`, `MENTOR` (este ainda sem rotas próprias) |

### Códigos de erro

| HTTP | `codigo` | Quando |
| --- | --- | --- |
| 400 | `VALIDACAO_INVALIDA` | Corpo, query ou parâmetro inválido (a mensagem é genérica, sem detalhe por campo) |
| 401 | `NAO_AUTENTICADO` | Sem sessão, sessão inválida/expirada ou utilizador inexistente |
| 401 | `CREDENCIAIS_INVALIDAS` | Login com email ou palavra-passe errados |
| 403 | `SEM_PERMISSAO` | Papel sem acesso à rota |
| 403 | `CONTA_NAO_ATIVA` | Conta suspensa ou desativada |
| 404 | `NAO_ENCONTRADA` | Recurso inexistente ou de outro utilizador |
| 404 | `NAO_ENCONTRADO` | Rota inexistente |
| 404 | `PERFIL_NAO_ENCONTRADO` | O candidato ainda não criou perfil (estado normal) |
| 409 | `EMAIL_JA_EXISTE` | Registo com email já usado |
| 409 | `CANDIDATURA_DUPLICADA` | Já existe candidatura ativa (não cancelada/rejeitada) para a oportunidade |
| 429 | `DEMASIADAS_TENTATIVAS` | Limite de logins falhados excedido |
| 500 | `ERRO_INTERNO` | Erro não tratado (sem detalhes internos) |

O código 422 **não** é usado pela API atual.

### Limite de tentativas de login

`POST /auth/login`: no máximo **10 tentativas falhadas por IP em 15 minutos**; a 11.ª falhada responde 429 `DEMASIADAS_TENTATIVAS`. Logins bem-sucedidos não contam.

## Endpoints

### Autenticação
| Método | Rota | Acesso | Corpo | Resposta |
| --- | --- | --- | --- | --- |
| POST | `/auth/register` | Público | `{ nome (2–120), email, palavraPasse (8–200) }` | 201 `{ data: Utilizador }` + cookie |
| POST | `/auth/login` | Público | `{ email, palavraPasse }` | 200 `{ data: Utilizador }` + cookie |
| POST | `/auth/logout` | Público | — | 200 `{ ok: true }` (limpa o cookie) |
| GET | `/auth/me` | Autenticado | — | 200 `{ data: Utilizador }`; 401 sem sessão (normal para visitantes) |

`Utilizador = { id, nome, email, papel }`.

### Referências (novo)
| Método | Rota | Acesso | Resposta |
| --- | --- | --- | --- |
| GET | `/referencias` | Público, só leitura | `{ data: { tipos, niveis, categorias } }` |

- `tipos`: `{ id, codigo, nome, descricao }[]` (só ativos, ordenados por nome)
- `niveis`: `{ id, codigo, nome, ordem }[]` (só ativos, ordenados por `ordem`)
- `categorias`: `{ id, nome, slug }[]` (ordenadas por nome)

Traz os IDs reais da base de dados. Os filtros do catálogo usam o `codigo` (tipo e nível) ou o `slug` (categoria); os formulários (perfil e administração) usam o `id`. Resposta com `Cache-Control: public, max-age=300`.

### Oportunidades (catálogo público)
| Método | Rota | Acesso | Notas |
| --- | --- | --- | --- |
| GET | `/oportunidades` | Público | Só `estadoEditorial = PUBLICADA` |
| GET | `/oportunidades/:id` | Público | 404 se não existir ou não estiver publicada |

Query de `GET /oportunidades` (todos opcionais, `strict`): `pagina` (≥1, por omissão 1), `limite` (1–50, por omissão 10), `q` (1–200; título ou entidade), `tipo` (código, ex. `BOLSA_UNIVERSITARIA`), `nivel` (código, ex. `MESTRADO`), `categoria` (slug), `paisDestino` (2 letras), `financiamento` (`INTEGRAL|PARCIAL|PROPINA|ESTIPENDIO|CURSO_GRATUITO|OUTRO`), `elegibilidadeAngolanos` (`ELEGIVEL|NAO_ELEGIVEL|POR_CONFIRMAR`), `estadoPrazo` (`FUTURO|ABERTO|EXPIRADO|SEM_PRAZO_CONFIRMADO`), `ordenar` (`prazo` — por omissão, nulos no fim — ou `recentes`).

Item da lista: `id, titulo, entidadeFinanciadora, tipo{codigo,nome}, nivelEnsino{codigo,nome}|null, paisDestinoCodigo|null, modalidade|null, tipoFinanciamento, valorFinanciamento|null, moeda|null, dataAbertura|null, prazoCandidatura|null, urlFonteOficial, ultimaVerificacaoEm|null, estadoPrazo, elegibilidadeAngolanos`.

Detalhe: os campos acima (com `tipo` a incluir `descricao`) mais `descricao, cicloAno, urlCandidatura, categorias[{nome,slug}], regras[], documentosExigidos[], elegibilidadePaises[]`.

#### Estado do prazo (calculado, nunca guardado)
Implementação única em `src/shared/utils/prazo.ts`, usada por catálogo, detalhe, favoritos e candidaturas. O filtro `estadoPrazo` aplica exatamente as mesmas regras, pela mesma ordem:

1. sem `prazoCandidatura` → `SEM_PRAZO_CONFIRMADO`
2. `prazoCandidatura` < hoje → `EXPIRADO`
3. `dataAbertura` > hoje → `FUTURO`
4. caso contrário → `ABERTO` (o próprio dia do prazo ainda é `ABERTO`)

"Hoje" é a **meia-noite UTC** do dia corrente (as colunas são `DATE`). Os quatro estados particionam o catálogo (cada oportunidade está em exatamente um filtro).

### Favoritos (autenticado, qualquer papel)
| Método | Rota | Resposta |
| --- | --- | --- |
| GET | `/favoritos` | `{ data: Favorito[] }`, mais recentes primeiro |
| POST | `/favoritos/:oportunidadeId` | 201 `{ ok: true }` (idempotente: repetir não dá erro); 404 se não estiver publicada |
| DELETE | `/favoritos/:oportunidadeId` | 200 `{ ok: true }` (idempotente) |

`Favorito = { id (da oportunidade), titulo, entidadeFinanciadora, tipo{codigo,nome}, estadoEditorial, valorFinanciamento|null, moeda|null, prazoCandidatura|null, estadoPrazo, urlFonteOficial, favoritadoEm }`. Um favorito cuja oportunidade foi arquivada continua na lista, com `estadoEditorial` diferente de `PUBLICADA`.

### Candidaturas (autenticado, qualquer papel; cada utilizador só vê as suas)
| Método | Rota | Corpo | Resposta |
| --- | --- | --- | --- |
| GET | `/candidaturas` | — | `{ data: Candidatura[] }` (por `atualizadoEm` desc.) |
| POST | `/candidaturas` | `{ oportunidadeId }` | 201 `{ data: Candidatura }`; 409 `CANDIDATURA_DUPLICADA` |
| GET | `/candidaturas/:id` | — | `{ data: Candidatura & { historico[] } }`; 404 se for de outro utilizador |
| PATCH | `/candidaturas/:id` | `{ estado (obrigatório), notasPrivadas? (≤2000), observacao? (≤500) }` | `{ data: Candidatura }` |

Estados: `PLANEADA, EM_PREPARACAO, SUBMETIDA_EXTERNAMENTE, EM_AVALIACAO, ACEITE, REJEITADA, CANCELADA`. Qualquer transição é aceite (não há máquina de estados). O histórico só regista uma linha quando o estado muda. `dataSubmissaoExterna` é preenchida na primeira passagem para `SUBMETIDA_EXTERNAMENTE`.

### Perfis (só `CANDIDATO`; MENTOR e ADMIN recebem 403)
| Método | Rota | Corpo | Resposta |
| --- | --- | --- | --- |
| GET | `/perfis/me` | — | `{ data: Perfil }`; 404 `PERFIL_NAO_ENCONTRADO` se ainda não existir |
| PUT | `/perfis/me` | `{ nacionalidadeCodigo (2 letras, obrigatório), dataNascimento?, nivelEnsinoAtualId? (uuid), areaEstudo? (≤100), instituicaoEnsino? (≤200), paisDestinoPreferido? (2 letras), idiomas? ({ [código]: nível }) }` | `{ data: Perfil }` |

O schema é estrito e **não aceita strings vazias** nem `null`: campos sem valor devem ser omitidos. Como o PUT faz `upsert`, um campo omitido **mantém** o valor anterior (não há forma de limpar um campo).

### Administração (só `ADMIN`)
| Método | Rota | Notas |
| --- | --- | --- |
| GET | `/admin/metricas` | `{ data: { utilizadores, oportunidades, pendencias, candidaturas } }` |
| GET | `/admin/oportunidades` | Query: `pagina`, `limite` (≤50), `estadoEditorial`, `pesquisa`. Itens "resumo" (sem descrição) |
| POST | `/admin/oportunidades` | 201; cria sempre em `RASCUNHO` |
| GET | `/admin/oportunidades/:id` | **Registo completo** (ver abaixo) |
| PATCH | `/admin/oportunidades/:id` | Parcial, pelo menos 1 campo; devolve o resumo |
| POST | `/admin/oportunidades/:id/publicar` | `PUBLICADA` + `ultimaVerificacaoEm` + registo de verificação + auditoria |
| POST | `/admin/oportunidades/:id/arquivar` | `ARQUIVADA` + auditoria |

Corpo de criação/edição (`strict`): `titulo (3–200), entidadeFinanciadora (2–200), tipoOportunidadeId (uuid), descricao (≥10), nivelEnsinoId?, paisDestinoCodigo? (2 letras), modalidade? (PRESENCIAL|ONLINE|HIBRIDA|NAO_APLICAVEL), tipoFinanciamento, valorFinanciamento? (número ≥0 ou string "123" / "123.45"), moeda? (3 letras), dataAbertura?, prazoCandidatura?, cicloAno? (≤20), urlFonteOficial (URL), urlCandidatura?`. Campos opcionais devem ser **omitidos**, não enviados vazios; não é possível limpar um campo já preenchido.

**Alteração:** `GET /admin/oportunidades/:id` devolve agora, além do resumo, `descricao`, `tipoOportunidadeId`, `nivelEnsinoId`, `nivelEnsino{codigo,nome}|null`, `paisDestinoCodigo|null`, `modalidade|null`, `categorias`, `regras`, `documentosExigidos`, `elegibilidadePaises` e `verificacoes`. Antes faltavam `tipoOportunidadeId`, `nivelEnsinoId`, `paisDestinoCodigo` e `modalidade`, pelo que o formulário de edição não se conseguia pré-preencher.

## Variáveis de ambiente

Backend (`Backend/.env`, nunca versionado; modelo em `.env.example`):

| Variável | Para quê |
| --- | --- |
| `DATABASE_URL` | Ligação PostgreSQL |
| `PORT` | Porta da API (por omissão 3000) |
| `SESSION_SECRET` | Assina o JWT da sessão; mínimo 32 caracteres; único por ambiente |
| `FRONTEND_URL` | Origem exata autorizada pelo CORS com credenciais (ex. `http://localhost:5173`) |
| `NODE_ENV` | `production` ativa o atributo `Secure` do cookie |
| `SEED_ADMIN_PASSWORD`, `SEED_DEMO_PASSWORD` | Só para `npm run db:seed` (nunca em produção) |

Frontend (`Frontend/.env`): `VITE_API_URL` (opcional; omitido = `/api/v1` via proxy do Vite) e `VITE_PROXY_TARGET` (destino do proxy em desenvolvimento).

### Dois modos de ligação em desenvolvimento
1. **Proxy (recomendado):** o browser fala só com `http://localhost:5173`; o Vite reencaminha `/api` para `http://localhost:3000`. Mesma origem, sem CORS.
2. **Direto:** `VITE_API_URL=http://localhost:3000/api/v1` no frontend e `FRONTEND_URL=http://localhost:5173` no backend. `localhost:5173` e `localhost:3000` são o mesmo *site* (as portas não contam), por isso o cookie `SameSite=Lax` é enviado.

### Produção (checklist)
- `NODE_ENV=production` e HTTPS de ponta a ponta (cookie `Secure`).
- Frontend e API no **mesmo site** (ex. `app.exemplo.ao` e `api.exemplo.ao`) ou atrás do mesmo domínio via proxy reverso. Com `SameSite=Lax` o cookie não viaja em pedidos entre sites diferentes.
- `FRONTEND_URL` = origem exata do frontend (esquema + domínio + porta).
- `SESSION_SECRET` novo e aleatório (≥ 32 caracteres), fora do repositório.
- Atrás de proxy reverso, configurar `trust proxy` no Express; caso contrário todos os utilizadores aparecem com o IP do proxy e partilham o mesmo limite de logins.
