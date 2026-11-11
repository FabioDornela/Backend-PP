const jwt = require("jsonwebtoken");
const { env } = require("../config/env");

function gerarToken(usuarioId) {
  return jwt.sign({ sub: String(usuarioId) }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });
}

// Lança erro se o token for inválido ou estiver expirado.
function verificarToken(token) {
  return jwt.verify(token, env.jwtSecret);
}

module.exports = { gerarToken, verificarToken };
