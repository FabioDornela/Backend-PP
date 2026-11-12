import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import rotas from "./routes/index.js";
import { limiteGeral } from "./middlewares/limitarRequisicoes.js";
import { rotaNaoEncontrada, tratarErros } from "./middlewares/tratarErros.js";

const app = express();

app.disable("x-powered-by");

app.use(cors());

// Arquivos enviados: sem listagem de pasta, sem dotfiles e sem sniffing de tipo.
app.use(
  "/uploads",
  express.static(env.uploadDir, {
    index: false,
    dotfiles: "deny",
    fallthrough: false,
    setHeaders: (res) => {
      res.setHeader("X-Content-Type-Options", "nosniff");
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    },
  })
);

app.use(express.json({ limit: "100kb" }));

// Aceita rotas tanto com /api quanto direto na raiz /
app.use("/api", limiteGeral, rotas);
app.use("/", limiteGeral, rotas);

app.use(rotaNaoEncontrada);
app.use(tratarErros);

export default app;