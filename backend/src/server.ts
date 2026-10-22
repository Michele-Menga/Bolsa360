import app from "./app";
import { env } from "./config/env";

const PORTA = env.PORT;

app.listen(PORTA, () => {
    console.log(`Servidor em http://localhost:${PORTA}`);
});