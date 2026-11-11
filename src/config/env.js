const path = require("path");

require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const SEGREDO_EXEMPLO = "troque_por_um_segredo_forte";

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 5000),
  db: {
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "portalpet_db",
  },
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
  uploadDir: path.resolve(__dirname, "../../", process.env.UPLOAD_DIR || "uploads"),
  uploadMaxMb: Number(process.env.UPLOAD_MAX_MB || 5),
};

// Falha cedo, com mensagem clara, se a configuração mínima não estiver correta.
function validarAmbiente() {
  const problemas = [];

  if (!env.jwtSecret) {
    problemas.push(
      "JWT_SECRET não definido. Copie backend/.env.example para backend/.env e informe um segredo forte."
    );
  } else if (env.jwtSecret.length < 16) {
    problemas.push("JWT_SECRET precisa ter pelo menos 16 caracteres.");
  } else if (env.jwtSecret === SEGREDO_EXEMPLO && env.nodeEnv === "production") {
    problemas.push("Troque o JWT_SECRET de exemplo por um segredo próprio antes de usar em produção.");
  }

  if (!Number.isInteger(env.port) || env.port <= 0) problemas.push("PORT inválida.");
  if (!(env.uploadMaxMb > 0)) problemas.push("UPLOAD_MAX_MB inválido.");

  if (problemas.length) {
    throw new Error(problemas.map((p) => `- ${p}`).join("\n"));
  }

  if (env.jwtSecret === SEGREDO_EXEMPLO) {
    console.warn("[aviso] JWT_SECRET está com o valor de exemplo. Use um segredo próprio.");
  }
}

module.exports = { env, validarAmbiente };
