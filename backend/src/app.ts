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
import { referenciasRouter } from "./modules/referencias/referencias.routes";

const app = express();

app.use(cors({ origin: env.FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get("/api/v1/saude", (_req, res) => {
  res.json({ estado: "ok" });
});

app.use("/api/v1/auth", autenticacaoRouter);
app.use("/api/v1/oportunidades", oportunidadesRouter);
app.use("/api/v1/referencias", referenciasRouter);
app.use("/api/v1/admin", administracaoRouter);
app.use("/api/v1/perfis", perfisRouter);
app.use("/api/v1/favoritos", favoritosRouter);
app.use("/api/v1/candidaturas", candidaturasRouter);

app.use(notFound);
app.use(errorHandler);

export default app;
