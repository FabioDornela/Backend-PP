const express = require("express");
const cors = require("cors");
const { env } = require("./config/env");
const rotas = require("./routes");
const { limiteGeral } = require("./middlewares/limitarRequisicoes");
const { rotaNaoEncontrada, tratarErros } = require("./middlewares/tratarErros");

const app = express();

app.disable("x-powered-by");

app.use(
  cors()
);

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

app.use("/api", limiteGeral, rotas);

app.use(rotaNaoEncontrada);
app.use(tratarErros);

module.exports = app;
