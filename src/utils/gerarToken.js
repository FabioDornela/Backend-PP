import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

function gerarToken(usuarioId) {
  return jwt.sign({ sub: String(usuarioId) }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });
}

// Lança erro se o token for inválido ou estiver expirado.
function verificarToken(token) {
  return jwt.verify(token, env.jwtSecret);
}

export { gerarToken, verificarToken };