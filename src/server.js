import { env, validarAmbiente } from "./config/env.js";
import { inicializarBanco } from "./config/database.js";
import app from "./app.js";

async function iniciar() {
  try {
    validarAmbiente();
  } catch (erro) {
    console.error("\n[ERRO] Configuração inválida em backend/.env:\n" + erro.message + "\n");
    process.exit(1);
  }

  try {
    await inicializarBanco();
    console.log(`MySQL conectado (${env.db.host}:${env.db.port}/${env.db.database}). Tabelas verificadas.`);
  } catch (erro) {
    console.error("\n[ERRO] O backend NÃO foi iniciado.\n" + erro.message + "\n");
    process.exit(1);
  }

  app.listen(env.port, () => {
    console.log(`API PortalPet rodando em http://localhost:${env.port}/api`);
  });
}

iniciar();