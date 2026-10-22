# ADR-003 — Sessão com JWT num cookie HttpOnly

- **Estado:** Aceite
- **Data:** 2026-10-22
- **Responsável:** Dillan (Backend/API)
- **Relacionado:** RN-14, RF-01, `docs/seguranca.md`

## Contexto

A API é consumida por uma SPA React servida em `FRONTEND_URL` (por omissão
`http://localhost:5173`), num domínio diferente do backend. Precisamos de manter
o utilizador autenticado entre pedidos, sem guardar estado de sessão em memória
do processo e sem expor o token a JavaScript do browser.

Requisitos que pesaram na decisão:

- o token não deve ser legível por JavaScript (mitigação de XSS);
- o cliente deve poder enviar a sessão automaticamente com
  `credentials: "include"`;
- o logout tem de ser simples de implementar;
- o âmbito é um projeto académico, sem infraestrutura de Redis nem balanceador
  com sessões partilhadas;
- uma conta suspensa ou desativada deve perder acesso (RN-14).

## Decisão

Usar um **JWT assinado com `SESSION_SECRET`** (HS256, o algoritmo por omissão do
`jsonwebtoken`) guardado num cookie:

| Atributo | Valor |
| --- | --- |
| Nome | `bolsa360_sessao` |
| `HttpOnly` | `true` |
| `SameSite` | `Lax` |
| `Secure` | apenas quando `NODE_ENV === "production"` |
| `Path` | `/` |
| `Max-Age` | 7 dias (`60 * 60 * 24 * 7` segundos) |

O payload contém apenas `sub` (o `id` do utilizador). Não guardamos papel,
email nem qualquer dado pessoal no token.

Em cada pedido autenticado, o middleware `authenticate`:

1. lê o cookie e verifica a assinatura e a expiração do JWT;
2. volta a carregar o utilizador na base de dados;
3. rejeita com `401 NAO_AUTENTICADO` se o token for inválido ou o utilizador já
   não existir;
4. rejeita com `403 CONTA_NAO_ATIVA` se `estado !== ATIVO` (RN-14).

O `logout` limita-se a apagar o cookie. O CORS está restrito a
`env.FRONTEND_URL` com `credentials: true`.

Implementação: `backend/src/modules/autenticacao/sessao.ts`,
`backend/src/middlewares/authenticate.ts` e `backend/src/app.ts`.

## Alternativas consideradas

### Sessões no servidor (`express-session` + store SQL/Redis)

Permitiria revogação imediata e um logout com invalidação real. Foi rejeitada
por acrescentar um store, limpeza de sessões expiradas e configuração extra
para um ganho que o MVP não exige. Fica como evolução natural se a revogação
passar a ser requisito.

### JWT em `localStorage` com cabeçalho `Authorization`

É simples, mas expõe o token a qualquer XSS e obriga o cliente a gerir o
cabeçalho em todos os pedidos. O cookie `HttpOnly` elimina essa exposição.

### JWT em cookie + token CSRF

É a variante mais robusta contra CSRF, mas implica um endpoint/header adicional
e coordenação com o frontend. Para o MVP considerou-se suficiente a combinação
`SameSite=Lax` + allowlist de origem no CORS + `Content-Type: application/json`.
Se surgirem fluxos cross-site, esta decisão deve ser revista.

### Access token curto + refresh token

Reduz a janela de um token roubado, mas duplica endpoints, rotação e deteção de
reutilização. Não se justifica no âmbito atual.

## Consequências

### Positivas

- O token não é acessível a JavaScript (`HttpOnly`), reduzindo o impacto de XSS.
- O backend não guarda estado de sessão; qualquer processo com o mesmo segredo
  valida o token.
- A sessão sobrevive a recargas da SPA e a reinícios do servidor.
- O estado da conta é verificado em cada pedido, pelo que suspender ou desativar
  um utilizador corta o acesso no pedido seguinte.
- O logout é simples e funciona apenas no browser do utilizador.

### Negativas e riscos aceites

- **Não há revogação no servidor.** O logout apaga o cookie, mas um token já
  copiado continua criptograficamente válido até expirar (7 dias). Uma
  blocklist/`jti` em base de dados resolveria isto, mas acrescenta uma consulta
  por pedido e limpeza de registos.
- **A expiração é longa (7 dias).** Um token roubado tem uma janela grande. O
  risco é mitigado por `HttpOnly`, `Secure` em produção e `SameSite=Lax`; um TTL
  mais curto com refresh token é a evolução recomendada.
- **Rodar o `SESSION_SECRET` invalida todas as sessões.** É o comportamento
  esperado e serve como botão de emergência, mas obriga a um novo login global.
- **Suspensão não invalida o JWT em si.** O token continua a existir; o acesso é
  negado porque o estado é relido na base de dados. Se a base de dados estiver
  indisponível, o pedido falha (não há autorização "otimista").
- **O rate limit do login é em memória e por processo.** Reinícios limpam o
  contador e várias instâncias não o partilham.
- **O cookie exige HTTPS em produção.** Com `secure: true`, um deployment em
  HTTP simplesmente não recebe o cookie.

## Mitigações e evolução

- Manter `Secure` ativo em produção e servir a API apenas por HTTPS.
- Garantir `SESSION_SECRET` com pelo menos 32 caracteres (validação no arranque)
  e nunca o versionar.
- Rever a janela de 7 dias se o risco justificar refresh tokens.
- Se for exigida revogação imediata, introduzir `jti` + tabela de sessões ou
  migrar para `express-session` com store partilhado.
- Adicionar token CSRF se o frontend passar a fazer pedidos cross-site que não
  sejam cobertos por `SameSite=Lax`.

## Referências

- `backend/src/modules/autenticacao/sessao.ts`
- `backend/src/middlewares/authenticate.ts`
- `backend/src/middlewares/authorize.ts`
- `backend/src/app.ts`
- `docs/seguranca.md`
