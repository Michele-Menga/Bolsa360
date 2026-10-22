# Segurança do backend Bolsa360

**Âmbito:** API Node/Express + PostgreSQL do Bolsa360 (P0).
**Última atualização:** 2026-10-22.
**Responsável:** Dillan (Backend/API).

Este documento descreve os controlos **realmente implementados** no código, as
limitações conhecidas e o que falta fazer antes de produção. Não é uma lista de
intenções: cada ponto indica o ficheiro onde pode ser confirmado.

---

## 1. Modelo de confiança

- O browser (SPA React) é tratado como não confiável: todos os dados de entrada
  são validados no servidor.
- A API e a base de dados correm em ambiente controlado pela equipa.
- O canal HTTP é considerado inseguro fora de `localhost`; em produção exige
  HTTPS (ver secção 9).
- Não há uploads de ficheiros nem execução de código enviado pelo cliente no P0.

---

## 2. Autenticação

| Controlo | Implementação |
| --- | --- |
| Hash de palavras-passe | `argon2id` (`argon2` 0.41.1), salt automático, parâmetros por omissão. Nunca é devolvido nem registado. |
| Normalização de email | `trim()` + `toLowerCase()` em `shared/utils/email.ts`; o email é `@unique` na base de dados. |
| Registo | Cria sempre `CANDIDATO`; o papel não é aceite no corpo (`autenticacao.schema.ts` é `.strict()`), logo não há escalada de privilégios no registo. |
| Mensagens de erro | Email inexistente e palavra-passe errada devolvem o mesmo `401 CREDENCIAIS_INVALIDAS` (evita enumeração de contas). |
| Rate limit do login | 10 falhas por 15 minutos por IP → `429 DEMASIADAS_TENTATIVAS`; `skipSuccessfulRequests: true` (só conta respostas falhadas). |
| Estado da conta (RN-14) | Após validar a palavra-passe, o login rejeita contas `SUSPENSO`/`DESATIVADO` com `403 CONTA_NAO_ATIVA`. |

Notas:

- O rate limit é **em memória e por processo** (`express-rate-limit` sem store).
  Reinicia com o processo e não é partilhado entre instâncias.
- O rate limit aplica-se apenas a `POST /auth/login`; registo e restantes rotas
  não têm limite próprio.
- Não existem verificação de email, recuperação de palavra-passe nem MFA no P0.

---

## 3. Sessão

Decisão registada em `docs/adrs/ADR-003-sessao-jwt-cookie.md`.

| Aspeto | Valor |
| --- | --- |
| Token | JWT assinado com `SESSION_SECRET` (HS256 por omissão do `jsonwebtoken`) |
| Payload | Apenas `sub` (id do utilizador) |
| Validade | 7 dias |
| Cookie | `bolsa360_sessao`, `HttpOnly`, `SameSite=Lax`, `Path=/` |
| `Secure` | Só com `NODE_ENV === "production"` |
| Segredo | `SESSION_SECRET` com pelo menos 32 caracteres, validado no arranque (`config/env.ts`) |

Em cada pedido autenticado, `middlewares/authenticate.ts` verifica a assinatura
e a expiração, recarrega o utilizador na base de dados e nega acesso a contas
não `ATIVO`.

**Limitação principal:** não há revogação no servidor. O `logout` apaga o
cookie, mas um token já copiado continua válido até expirar. A mitigação atual é
a verificação do estado da conta em cada pedido; uma blocklist de `jti` ou
sessões em base de dados fica como evolução.

O JWT é **assinado, não encriptado**. Como o payload só tem o `id`, não há dados
pessoais expostos no cookie.

---

## 4. Autorização

- `authenticate` popula `res.locals.utilizador`; `authorize(...papeis)` aplica
  RBAC (`middlewares/authorize.ts`).
- Rotas administrativas: `authenticate` + `authorize(ADMIN)` em
  `modules/administracao/administracao.routes.ts`.
- Perfil, favoritos e candidaturas: `authenticate` + `authorize(CANDIDATO)`.
- Favoritos e candidaturas são sempre filtrados pelo `utilizadorId` da sessão;
  nunca por um id enviado pelo cliente.
- Acesso a candidatura de outro utilizador devolve **404** (e não 403), para não
  revelar a existência do recurso (`candidaturas.service.ts`).
- O catálogo público só devolve oportunidades `PUBLICADA`; rascunhos, pendentes
  e arquivadas só são visíveis em rotas de administração.
- Não há endpoints de mentoria/pagamentos no P0 (P2 congelado).

---

## 5. Validação de entrada e saída

- Todos os corpos passam por schemas Zod; os principais usam `.strict()`, pelo
  que campos desconhecidos dão `400 VALIDACAO_INVALIDA`.
- Query strings e parâmetros de rota também são validados (`validateQuery`,
  `validateParams`); ids são `uuid()`.
- Os erros de validação devolvem uma mensagem genérica, sem detalhes de campos,
  para não expor a estrutura interna. O cliente deve guiar-se pelo código
  `VALIDACAO_INVALIDA`.
- Valores `Decimal` são serializados como **string** para não perder precisão.
- O formato de erro é sempre `{ erro: { codigo, mensagem } }`.

---

## 6. CORS e CSRF

- CORS restrito a `env.FRONTEND_URL`, com `credentials: true`
  (`app.ts`). Não há `origin: "*"`.
- O cookie é `SameSite=Lax`, o que impede o envio em pedidos POST/PUT/PATCH/
  DELETE iniciados por outro site. Isto cobre o vetor CSRF clássico.
- Os pedidos com `Content-Type: application/json` disparam preflight; origens
  fora da allowlist são bloqueadas pelo browser.
- **Não existe token CSRF.** A proteção assenta em `SameSite=Lax` + allowlist de
  origem. Se o frontend passar a usar fluxos cross-site ou subdomínios não
  confiáveis, esta decisão deve ser revista e deve ser adicionado um token
  anti-CSRF.
- CORS não protege contra clientes que não sejam browsers (ex.: `curl`); nesses
  casos a autenticação e a autorização continuam a ser a barreira.

---

## 7. Acesso a dados

- Todo o acesso passa pelo Prisma, com queries parametrizadas; não há SQL
  concatenado no código da aplicação.
- O SQL cru existe apenas em migrações (restrições e índices), não recebe input
  de utilizadores.
- A base de dados reforça invariantes: email único, candidatura ativa única por
  utilizador/oportunidade e restrições de integridade do P2.
- As credenciais da base de dados vêm de `DATABASE_URL` (`.env` não versionado).
  Em produção deve ser usado um utilizador com o mínimo de privilégios.

---

## 8. XSS e conteúdo

- O cookie é `HttpOnly`, pelo que um XSS não consegue ler a sessão diretamente.
- A API devolve apenas JSON; não serve HTML nem interpola dados em templates.
- A responsabilidade de escapar texto ao renderizar é do frontend. Recomenda-se
  CSP no servidor que serve a SPA e evitar `dangerouslySetInnerHTML` com dados
  da API.
- Não há endpoints que devolvam HTML ou ficheiros gerados a partir de input.

---

## 9. Transporte e cabeçalhos HTTP

- Em produção o cookie só é enviado com `Secure`, o que obriga a HTTPS. O
  deployment deve terminar TLS num proxy reverso e redirecionar HTTP → HTTPS.
- **Não está instalado `helmet`.** Faltam, por isso, cabeçalhos como HSTS,
  `X-Content-Type-Options: nosniff`, `Referrer-Policy` e uma CSP. O Express
  também envia `X-Powered-By` por omissão, que deve ser desativado.
- Recomenda-se configurar estes cabeçalhos no proxy reverso ou adicionar
  `helmet` numa próxima iteração.

---

## 10. Segredos e configuração

- `backend/.env` está no `.gitignore`; o modelo é `backend/.env.example`.
- `SESSION_SECRET` é obrigatório e tem de ter pelo menos 32 caracteres; o
  arranque falha se não cumprir.
- As palavras-passe de seed vêm de `SEED_ADMIN_PASSWORD` e
  `SEED_DEMO_PASSWORD`. São credenciais de demonstração: **nunca** devem ser
  usadas em produção e devem ser alteradas em qualquer ambiente partilhado.
- Não há segredos no código nem nos testes. Evitar registar tokens, cookies,
  palavras-passe ou `DATABASE_URL` em logs.
- O `SESSION_SECRET` deve ser único por ambiente; rodá-lo invalida todas as
  sessões, o que serve como resposta a incidente.

---

## 11. Erros e registos

- `AppError` produz respostas controladas com código e mensagem.
- Erros inesperados devolvem `500 ERRO_INTERNO` sem stack trace; o detalhe é
  escrito apenas no servidor via `console.error` (`middlewares/error-handler.ts`).
- Não há logging estruturado, correlação de pedidos nem alertas no P0.
- O modelo `RegistoAuditoria` (`registos_auditoria`) já existe no schema, mas
  **ainda não é escrito** pela aplicação; a auditoria das ações
  administrativas está prevista para a tarefa seguinte (RN-08).

---

## 12. Dependências e manutenção

- Versões críticas fixadas: `@prisma/client`/`prisma` 6.19.3, `argon2` 0.41.1.
- Node fixado em 20.20.2 nesta máquina; o Node 22 é incompatível com os
  binários do `argon2` instalados, pelo que a equipa deve usar a mesma versão.
- Não há verificação automática de vulnerabilidades no CI. Antes de entregar e
  periodicamente, correr `npm audit` no `backend/`.
- Atualizações de dependências devem ser coordenadas com a equipa e seguidas de
  `npm test` + `npx tsc --noEmit`.

---

## 13. Limitações conhecidas (backlog de segurança)

1. Sem revogação de sessão no servidor (logout só apaga o cookie).
2. JWT com validade de 7 dias e sem refresh token.
3. Rate limit apenas no login, em memória e por processo.
4. Sem `helmet`/CSP/HSTS na aplicação (podem ser aplicados no proxy).
5. Sem token CSRF (mitigado por `SameSite=Lax` + CORS restrito).
6. Auditoria ainda não escrita apesar de o modelo existir.
7. Sem verificação de email, recuperação de palavra-passe ou MFA.
8. Sem monitorização, alertas ou logs estruturados.
9. Credenciais de seed de demonstração no `.env` local.

---

## 14. Checklist para produção

- [ ] Servir a API apenas por HTTPS e ativar `NODE_ENV=production` (cookie `Secure`).
- [ ] Gerar um `SESSION_SECRET` novo, aleatório e com ≥32 caracteres.
- [ ] Definir `FRONTEND_URL` com a origem exata do frontend (sem wildcards).
- [ ] Usar credenciais de base de dados dedicadas e com privilégios mínimos.
- [ ] Não correr o seed de demonstração ou alterar as palavras-passe de seed.
- [ ] Aplicar HSTS, `nosniff`, `Referrer-Policy` e CSP no proxy/aplicação.
- [ ] Desativar `X-Powered-By`.
- [ ] Configurar rate limit adicional no proxy e, se houver várias instâncias,
      um store partilhado para o login.
- [ ] Configurar backups, monitorização e retenção de logs.
- [ ] Correr `npm audit`, `npm test` e `npx tsc --noEmit` antes do deploy.
- [ ] Rever este documento sempre que uma decisão de sessão, CORS ou autorização
      mudar.
