import express from "express";
//Aqui nós configuramos o servidor e definimos as rotas

import { notFound } from "./middlewares/not-found";
import { errorHandler } from "./middlewares/error-handler";
import { oportunidadesRouter } from "./modules/oportunidades/oportunidades.routes";

const app = express(); //instancia do express
//ou seja, é um middleware que recebe todas as requisições

app.use(express.json());

app.get("/api/v1/saude", (_req, res) => {
    res.json({ estado: "ok" });
});

app.use("/api/v1/oportunidades", oportunidadesRouter);

app.use(notFound);        // se chegar aqui, cai em 404
app.use(errorHandler);    // captura qualquer erro

export default app;
