# Integração Frontend ↔ Backend — relatório

> **Estado honesto:** o ambiente onde isto foi feito não tinha rede (`npm install` falha) nem PostgreSQL. Por isso a integração foi feita por **auditoria estática do código** (rotas, schemas Zod, services, Prisma, seed) e o resultado **não foi executado**: nem `tsc`, nem `npm run build`, nem `vitest`, nem os fluxos do Passo 4. Tudo o que está marcado ⏳ tem de ser corrido por vocês; o Passo 4 tem uma lista e um script abaixo.

## 1. O que mudou

### Backend (commit `feat(backend)…`)
- **`GET /api/v1/referencias`** (público, só leitura): `{ tipos, niveis, categorias }` com IDs reais. Teste em `tests/referencias.test.ts`.
- **`GET /admin/oportunidades/:id`** passa a devolver também `tipoOportunidadeId`, `nivelEnsinoId`, `paisDestinoCodigo` e `modalidade` (já devolvia `descricao`; faltavam estes quatro para pré-preencher a edição).
- **`calcularEstadoPrazo` unificado** em `src/shared/utils/prazo.ts` (a duplicada do repositório foi removida). Testes em `tests/prazo.test.ts` (prazo nulo, passado, abertura futura, prazo hoje, UTC, dados incoerentes) e em `tests/oportunidades.test.ts` (filtro ≡ campo, lista ≡ detalhe, os 4 filtros particionam o catálogo). A lógica pura foi corrida aqui em 4 fusos (UTC, Luanda, Los Angeles, Auckland): ✅.
- `tests/mentor.test.ts`: MENTOR entra, lê o catálogo, recebe 403 em `/perfis/me` e `/admin/*`.
- `docs/api/README.md` (**criado**: não existia no zip recebido; foi escrito a partir do código. Se já têm uma versão, juntem as duas), `.gitignore` reforçado, `scripts/verificar-api.sh`.

### Frontend (commit `feat(frontend)…`)
- Tipos/níveis vêm de `useReferencias()`; **removidos os IDs fixos** de `format.ts` (ficam só rótulos). Catálogo, Início, Perfil e Admin usam-no.
- Edição admin carrega o registo completo antes de abrir o formulário (descrição, nível, país e modalidade pré-preenchidos; só se envia o que mudou).
- **MENTOR:** entra, fica no início, vê um aviso "área de mentores ainda não disponível", sem links inválidos; sem botões de favorito/planear (só visitante e candidato); `RequireAuth` e o login mandam cada papel para a sua página (sem ciclos).
- `api.ts`: backend em baixo (proxy do Vite devolve 500 **sem corpo**) ou timeout de 15 s → mensagem de ligação; 401 numa rota protegida limpa a sessão e redireciona para `/entrar`.
- Admin: erros já não aparecem com estilo de sucesso; pesquisa com debounce; sem promessas rejeitadas por tratar. Início mostra erro de ligação em vez de "sem oportunidades".
- `mock.ts` atualizado (`/referencias`, detalhe admin completo, utilizador MENTOR, prazo com as mesmas regras); `vite.preview.config.ts` intacto. Identidade visual e ecrãs de carregamento não foram tocados.

## 2. Divergências de contrato encontradas

| # | Divergência | Resolução |
| --- | --- | --- |
| 1 | Sem endpoint de tipos/níveis; frontend usava IDs do seed | `GET /referencias` |
| 2 | Detalhe admin sem IDs de tipo/nível, país, modalidade | Backend completado |
| 3 | Duas `calcularEstadoPrazo` com regras e fuso diferentes | Unificada (ver decisão A) |
| 4 | Backend em baixo via proxy do Vite → 500 sem corpo → mensagem genérica "erro inesperado" | `api.ts` trata como sem ligação |
| 5 | `/perfis/*` é só `CANDIDATO`; frontend chamava/mostrava favoritos, candidaturas e planear a qualquer papel | Gating por papel no frontend |
| 6 | Enunciado: "6+ tentativas → 429". O código real: **10 falhadas/15 min, a 11.ª dá 429** | Documentado; não alterei o limite (segurança) |
| 7 | `diasAte` usava "agora"; o backend usa dia UTC (`"1 dias"`) | Alinhado em UTC, singular corrigido |
| 8 | Favorito de oportunidade arquivada continuava a parecer disponível | Badge "Já não está disponível" |
| 9 | Respostas `{ ok: true }` (logout, favoritos) sem `data` | Já tratadas; documentado |

Confirmado sem divergência (por leitura): filtros do catálogo (`tipo`/`nivel` por **código**, `paisDestino`, `financiamento`, `elegibilidadeAngolanos`, `estadoPrazo`, `ordenar`, `pagina`, `limite`), Decimal como string, datas ISO, `PATCH /candidaturas` com `estado` obrigatório, envelope de erro `{ erro: { codigo, mensagem } }`, `PERFIL_NAO_ENCONTRADO` tratado como estado normal, `/auth/me` 401 silencioso.

## 3. Decisões e ambiguidades (escolhi a opção mais segura)
- **A. Ordem das regras do prazo.** Pediram a versão de `shared`, que testava "abertura futura" antes de "prazo passado". Mantive o ficheiro e a assinatura posicional de `shared`, mas **invertida a ordem** (expirado primeiro) e com "hoje" em **UTC**: é a ordem que os filtros SQL já aplicavam; com a outra, um registo incoerente (abertura depois do prazo) seria "Abre em breve" e o botão *Planear* ficaria ativo com o prazo ultrapassado. Só difere em dados incoerentes.
- **B.** ADMIN/MENTOR não veem favoritar/planear, apesar de o backend o permitir (`/favoritos` e `/candidaturas` aceitam qualquer papel autenticado). Não restringi o backend.
- **C.** Não é possível limpar campos opcionais (perfil e oportunidade): o schema rejeita `""`/`null` e o `upsert`/`update` ignora omitidos. Documentado.

## 4. Fluxos do Passo 4 — ⏳ NÃO EXECUTADOS
Nível API: `bash scripts/verificar-api.sh [URL] [--rate-limit]` no Backend (URL `http://localhost:5173/api/v1` testa o proxy). Cobre: catálogo e coerência dos filtros, cookie HttpOnly/SameSite=Lax, favoritos, candidatura + duplicada + histórico, 403 do candidato em `/admin`, criar→publicar→visível→arquivar→some, logout, 429. Também **não foi executado** (escrito sem BD).
Manuais (interface), com o resultado esperado:
1. Visitante: contadores do Início = `meta.total`; filtros/pesquisa (debounce 400 ms)/paginação; "Planear" sem sessão → `/entrar` e volta ao detalhe.
2. Registo novo; email duplicado (mensagem do backend); palavra-passe < 8; login errado; 11 falhadas → mensagem de `DEMASIADAS_TENTATIVAS`.
3. ana.demo: F5 mantém sessão; favoritar/desfavoritar; planear + duplicada; estados + histórico; notas; perfil (vazios omitidos); logout limpa cache.
4. admin: métricas; rascunho; editar (campos pré-preenchidos, só alterados seguem); publicar → aparece no catálogo; arquivar → desaparece; candidato em `/admin` → vai para `/painel`.
5. Cookie nos dois modos (proxy e `VITE_API_URL` + `FRONTEND_URL`).
6. Parar o backend: mensagem de ligação em Catálogo/Início/detalhe, sem spinner infinito.
7. daniel.demo (MENTOR): entra, fica no início com o aviso, sem links quebrados.

## 5. Pontos em aberto
- **Segredos:** o `Backend/.env` **veio dentro do zip** com valores que não são os do exemplo. Tratem `SESSION_SECRET`, a palavra-passe da BD e as `SEED_*` como expostas e rodem-nas se forem reais. O `.gitignore` já o exclui; garantam que nunca foi commitado (`git log --all -- Backend/.env`).
- Rodar `npm run build` (Frontend) e `npm test` (Backend) e corrigir o que o compilador apontar. Verificação parcial com `tsc` global: sem erros de sintaxe; os restantes vêm só de dependências em falta.
- `publicar` aceita qualquer estado (inclusive `REJEITADA`/`ARQUIVADA`) e não valida prazo ≥ abertura; não há máquina de estados nas candidaturas (RN/422 do documento).
- Atrás de proxy reverso configurar `trust proxy` (senão o limite de login é partilhado). No proxy do Vite, em desenvolvimento, todos partilham o mesmo IP.
- Mentoria e pagamentos: sem rotas nem ecrãs (por indicação).
- Erros de validação do backend não indicam o campo (`VALIDACAO_INVALIDA` genérico).
