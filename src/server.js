const { env, validarAmbiente } = require("./config/env");

async function iniciar() {
  try {
    validarAmbiente();
  } catch (erro) {
    console.error("\n[ERRO] Configuração inválida em backend/.env:\n" + erro.message + "\n");
    process.exit(1);
  }

  try {
    const { inicializarBanco } = require("./config/database");
    await inicializarBanco();
    console.log(`MySQL conectado (${env.db.host}:${env.db.port}/${env.db.database}). Tabelas verificadas.`);
  } catch (erro) {
    console.error("\n[ERRO] O backend NÃO foi iniciado.\n" + erro.message + "\n");
    process.exit(1);
  }

  const app = require("./app");
  app.listen(env.port, () => {
    console.log(`API PortalPet rodando em http://localhost:${env.port}/api`);
  });
}

iniciar();
