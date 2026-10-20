# API Bolsa360 — Referência (v1)

Base URL local: `http://localhost:3000/api/v1`

## Convenções

- **Autenticação**: sessão em JWT num cookie `bolsa360_sessao` (`HttpOnly`, `SameSite=Lax`). Enviar sempre `credentials: "include"` no cliente.
- **Formato de sucesso**: `{ "data": ... }` ou `{ "ok": true }`. Listagens paginadas devolvem também `meta`.
- **Formato de erro**: `{ "erro": { "codigo": "...", "mensagem": "..." } }`.
- **Valores monetários** (`valorFinanciamento`, etc.) são devolvidos como **string** para preservar precisão decimal.
- **Datas**: ISO 8601 (`2026-12-17T00:00:00.000Z`).
- **`estadoPrazo`** é calculado no servidor e nunca persistido:
  `FUTURO` | `ABERTO` | `EXPIRADO` | `SEM_PRAZO_CONFIRMADO`.
- **Corpo JSON**: enviar `Content-Type: application/json`. Campos desconhecidos são rejeitados (`400 VALIDACAO_INVALIDA`).

### Códigos de erro comuns

| Código | HTTP | Significado |
| --- | --- | --- |
| `VALIDACAO_INVALIDA` | 400 | Corpo/query/params inválidos |
| `NAO_AUTENTICADO` | 401 | Sem sessão válida |
| `CREDENCIAIS_INVALIDAS` | 401 | Email/palavra-passe errados |
| `SEM_PERMISSAO` | 403 | Papel sem acesso |
| `CONTA_NAO_ATIVA` | 403 | Conta desativada |
| `NAO_ENCONTRADA` | 404 | Recurso inexistente ou não público |
| `CANDIDATURA_DUPLICADA` | 409 | Já existe candidatura ativa |
| `EMAIL_JA_EXISTE` | 409 | Email já registado |
| `DEMASIADAS_TENTATIVAS` | 429 | Rate limit no login |
| `ERRO_INTERNO` | 500 | Erro inesperado |

---

## Autenticação

### `POST /auth/register`
Cria conta `CANDIDATO` e inicia sessão.

```json
{ "nome": "Ana", "email": "ana@example.org", "palavraPasse": "minimo8chars" }
```

`201` → `{ "data": { "id", "nome", "email", "papel" } }` (define cookie).

### `POST /auth/login`
```json
{ "email": "ana@example.org", "palavraPasse": "minimo8chars" }
```

`200` → `{ "data": { "id", "nome", "email", "papel" } }` (define cookie).
Limitado a 10 falhas por 15 minutos por IP → `429 DEMASIADAS_TENTATIVAS`.

### `POST /auth/logout`
`200` → `{ "ok": true }` (remove cookie).

### `GET /auth/me` 🔒
`200` → `{ "data": { "id", "nome", "email", "papel" } }`.

---

## Oportunidades (catálogo público)

Só devolve oportunidades com `estadoEditorial = PUBLICADA`.

### `GET /oportunidades`
Query (todos opcionais):

| Parâmetro | Tipo | Notas |
| --- | --- | --- |
| `pagina` | inteiro > 0 | default `1` |
| `limite` | inteiro 1–50 | default `10` |
| `q` | texto | pesquisa no título e entidade financiadora |
| `tipo` | texto | código do tipo, ex.: `BOLSA_UNIVERSITARIA` |
| `nivel` | texto | código do nível, ex.: `MESTRADO` |
| `categoria` | texto | slug, ex.: `engenharia` |
| `paisDestino` | 2 letras | ex.: `PT` |
| `financiamento` | enum | `INTEGRAL`, `PARCIAL`, `PROPINA`, `ESTIPENDIO`, `CURSO_GRATUITO`, `OUTRO` |
| `elegibilidadeAngolanos` | enum | `ELEGIVEL`, `NAO_ELEGIVEL`, `POR_CONFIRMAR` |
| `estadoPrazo` | enum | `FUTURO`, `ABERTO`, `EXPIRADO`, `SEM_PRAZO_CONFIRMADO` |
| `ordenar` | enum | `prazo` (default) ou `recentes` |

`200` →
```json
{
  "data": [
    {
      "id": "…", "titulo": "…", "entidadeFinanciadora": "…",
      "tipo": { "codigo": "…", "nome": "…" },
      "nivelEnsino": { "codigo": "…", "nome": "…" },
      "paisDestinoCodigo": "PT", "modalidade": "ONLINE",
      "tipoFinanciamento": "INTEGRAL", "valorFinanciamento": "12000",
      "moeda": "EUR", "dataAbertura": "…", "prazoCandidatura": "…",
      "estadoPrazo": "ABERTO", "elegibilidadeAngolanos": "ELEGIVEL",
      "urlFonteOficial": "https://…", "ultimaVerificacaoEm": "…"
    }
  ],
  "meta": { "pagina": 1, "limite": 10, "total": 5, "totalPaginas": 1 }
}
```

### `GET /oportunidades/:id`
`200` → `{ "data": { …detalhe, "regras": [], "documentosExigidos": [], "elegibilidadePaises": [] } }`.
`404 NAO_ENCONTRADA` se não existir ou não estiver `PUBLICADA`.

---

## Administração (papel `ADMIN`) 🔒

Todas as rotas exigem `ADMIN`.

| Método | Rota | Descrição |
| --- | --- | --- |
| `GET` | `/admin/oportunidades` | Lista com `pagina`, `limite`, `estadoEditorial`, `pesquisa` |
| `POST` | `/admin/oportunidades` | Cria em `RASCUNHO` → `201` |
| `GET` | `/admin/oportunidades/:id` | Detalhe (qualquer estado) |
| `PATCH` | `/admin/oportunidades/:id` | Atualização parcial |
| `POST` | `/admin/oportunidades/:id/publicar` | Publica + registo de verificação |
| `POST` | `/admin/oportunidades/:id/arquivar` | Arquiva |

Corpo de criação (campos `*` obrigatórios):
`titulo*`, `entidadeFinanciadora*`, `tipoOportunidadeId*`, `descricao*`,
`tipoFinanciamento*`, `urlFonteOficial*`; opcionais: `nivelEnsinoId`,
`paisDestinoCodigo`, `modalidade`, `valorFinanciamento` (número ou string decimal),
`moeda`, `dataAbertura`, `prazoCandidatura`, `cicloAno`, `urlCandidatura`.

---

## Perfil do candidato (papel `CANDIDATO`) 🔒

### `GET /perfis/me`
`200` → `{ "data": { … } }`; `404 PERFIL_NAO_ENCONTRADO` se ainda não existir.

### `PUT /perfis/me`
Cria ou atualiza (upsert). `nacionalidadeCodigo` é obrigatório.

```json
{
  "nacionalidadeCodigo": "AO",
  "dataNascimento": "2002-04-15",
  "nivelEnsinoAtualId": "uuid (opcional)",
  "areaEstudo": "Engenharia Informatica",
  "instituicaoEnsino": "ISPTEC",
  "paisDestinoPreferido": "PT",
  "idiomas": { "pt": "Nativo", "en": "B1" }
}
```

`200` → `{ "data": { "utilizadorId", "nacionalidadeCodigo", … } }`.

---

## Favoritos 🔒

Qualquer utilizador autenticado. Operações idempotentes.

| Método | Rota | Resposta |
| --- | --- | --- |
| `GET` | `/favoritos` | `200` → `{ "data": [ { "id", "titulo", "tipo", "estadoPrazo", "favoritadoEm", … } ] }` |
| `POST` | `/favoritos/:oportunidadeId` | `201` → `{ "ok": true }` (repetir não duplica) |
| `DELETE` | `/favoritos/:oportunidadeId` | `200` → `{ "ok": true }` |

`POST` só aceita oportunidade `PUBLICADA`; caso contrário `404 NAO_ENCONTRADA`.

---

## Candidaturas 🔒

Cada utilizador só vê/gere as suas. Um `CANDIDATO` pode ter no máximo **uma
candidatura ativa** por oportunidade (estados `CANCELADA`/`REJEITADA` libertam a vaga).

### `GET /candidaturas`
`200` → `{ "data": [ { "id", "estado", "notasPrivadas", "dataSubmissaoExterna",
"oportunidade": { "id", "titulo", "estadoPrazo", … } } ] }`.

### `POST /candidaturas`
```json
{ "oportunidadeId": "uuid" }
```
`201` → `{ "data": { … } }` e regista entrada `PLANEADA` no histórico.
`404 NAO_ENCONTRADA` se a oportunidade não estiver `PUBLICADA`;
`409 CANDIDATURA_DUPLICADA` se já existir candidatura ativa.

### `GET /candidaturas/:id`
`200` → `{ "data": { …, "historico": [ { "estadoAnterior", "estadoNovo", "alteradoEm", "observacao" } ] } }`.
`404` se não for do utilizador.

### `PATCH /candidaturas/:id`
```json
{ "estado": "EM_PREPARACAO", "notasPrivadas": "…", "observacao": "opcional" }
```

Estados aceites: `PLANEADA`, `EM_PREPARACAO`, `SUBMETIDA_EXTERNAMENTE`,
`EM_AVALIACAO`, `ACEITE`, `REJEITADA`, `CANCELADA`.

Ao mudar de estado, grava automaticamente uma linha no histórico na mesma
transação. Ao entrar em `SUBMETIDA_EXTERNAMENTE`, preenche `dataSubmissaoExterna`
se ainda estiver vazia.

`200` → `{ "data": { … } }`; `404` se não for do utilizador.

---

## Saúde

### `GET /saude`
`200` → `{ "estado": "ok" }`.

> 🔒 = requer cookie de sessão válido.
