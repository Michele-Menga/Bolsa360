import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import { env } from "./config/env";
import { notFound } from "./middlewares/not-found";
import { errorHandler } from "./middlewares/error-handler";
import { oportunidadesRouter } from "./modules/oportunidades/oportunidades.routes";
import { autenticacaoRouter } from "./modules/autenticacao/autenticacao.routes";
import { administracaoRouter } from "./modules/administracao/administracao.routes";
import { perfisRouter } from "./modules/perfis/perfis.routes";
import { favoritosRouter } from "./modules/favoritos/favoritos.routes";
import { candidaturasRouter } from "./modules/candidaturas/candidaturas.routes";

const app = express();

// Configuração do CORS para permitir portas 5173 e 5174 com suporte a credenciais (cookies)
app.use(
  cors({
    origin: (origin, callback) => {
      const origensPermitidas = [
        "http://localhost:5173",
        "http://localhost:5174",
        env.FRONTEND_URL,
      ];
      if (!origin || origensPermitidas.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// Rota de verificação de saúde da API
app.get("/api/v1/saude", (_req, res) => {
  res.json({ estado: "ok" });
});

// Rotas dos módulos
app.use("/api/v1/auth", autenticacaoRouter);
app.use("/api/v1/oportunidades", oportunidadesRouter);
app.use("/api/v1/admin", administracaoRouter);
app.use("/api/v1/perfis", perfisRouter);
app.use("/api/v1/favoritos", favoritosRouter);
app.use("/api/v1/candidaturas", candidaturasRouter);

// Middlewares de tratamento de erros
app.use(notFound);
app.use(errorHandler);

export default app;