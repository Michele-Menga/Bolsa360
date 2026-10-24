# Bolsa360 · Frontend

React 18 + TypeScript + Vite + Tailwind 3 + React Router + TanStack Query. Componentes UI no estilo shadcn (cva + tailwind-merge) em `src/components/ui`.

## Arrancar

```bash
cd Backend  && npm run dev      # API em http://localhost:3000
cd Frontend && npm install && npm run dev   # http://localhost:5173
```

Em desenvolvimento o Vite faz proxy de `/api` para o backend, por isso o cookie `bolsa360_sessao` (HttpOnly, SameSite=Lax) funciona sem configuração.

**Modo direto (sem proxy):** cria `Frontend/.env` com `VITE_API_URL=http://localhost:3000/api/v1` e põe `FRONTEND_URL=http://localhost:5173` no `Backend/.env` (CORS com credenciais). `localhost:5173` e `localhost:3000` são o mesmo *site*, por isso o cookie `SameSite=Lax` é enviado.

**Produção:** `NODE_ENV=production` no backend (cookie `Secure`), HTTPS, `FRONTEND_URL` com a origem exata do frontend e frontend/API no mesmo site (ou atrás do mesmo domínio). Lista completa em `Backend/docs/api/README.md`.

## Identidade visual e animações

`src/components/brand/Bolsa360Logos.jsx` (OrbitLogo, BMark, Bolsa360Lockup, Bolsa360Loader). Cores/tipografia em `tailwind.config.js` (#FFC107, #111111, #6B6B6B, #E5E5E5, Poppins).

| Momento | Animação |
| --- | --- |
| Arranque da app / entrar / criar conta | `BootScreen`: só o B a transformar-se em livro (`BMark mode="morph"`) |
| Carregar páginas e secções do painel | `PageLoader` (`Bolsa360Loader`) |
| Planear candidatura, criar/editar/publicar/arquivar (admin) | `ProcessingOverlay`: B → livro (`BMark mode="morph"`) |
| Logo do cabeçalho | B → livro ao passar o rato |
| Hero, login, 404 | `OrbitLogo mode="draw"` |

## Endpoints usados (contrato real do backend)

`/auth/{register,login,logout,me}` · `/referencias` · `/oportunidades` (+filtros, `:id`) · `/favoritos` · `/candidaturas` (+`:id`, PATCH) · `/perfis/me` (GET/PUT) · `/admin/{metricas,oportunidades,oportunidades/:id,…/publicar,…/arquivar}`.

## Notas de integração

- Tipos, níveis de ensino e categorias (com IDs) vêm de `GET /referencias` (`useReferencias`, cache longa). `src/lib/format.ts` guarda só rótulos de apresentação (financiamento, prazo, países…).
- A edição de uma oportunidade (admin) carrega `GET /admin/oportunidades/:id` (registo completo) para pré-preencher o formulário; só se envia o que foi alterado. A API não permite limpar campos opcionais já preenchidos.
- Papéis: `CANDIDATO` → `/painel`; `ADMIN` → `/admin`; `MENTOR` → fica no início (a mentoria ainda não tem rotas nem ecrãs). Favoritos, candidaturas e perfil são só do candidato.
- Uma resposta 401 a uma rota protegida (sessão expirada) limpa a sessão local e redireciona para `/entrar`. Se o backend estiver em baixo, os pedidos falham com a mensagem de ligação (não ficam a carregar para sempre: limite de 15 s).
- `src/preview/mock.ts` (só com `VITE_PREVIEW`) simula a API, incluindo `/referencias` e o detalhe admin completo.
