import express from "express";
//Aqui nós configuramos o servidor e definimos as rotas

const app = express(); //instancia do express
//ou seja, é um middleware que recebe todas as requisições

app.use(express.json());

app.get("/api/v1/saude", (req, res) => {
    res.json({ estado: "ok" });
});
//regista uma rota onde o req é o pedido e o res é a resposta

app.get("/api/v1/ola/:nome", (req, res) => {
    const nome = req.params.nome;
    res.json({ mensagem: `Olá ${nome}` });
})
export default app;