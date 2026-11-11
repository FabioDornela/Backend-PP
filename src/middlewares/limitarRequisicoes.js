import { rateLimit } from "express-rate-limit";

function criarLimite(janelaMinutos, limite, mensagem) {
  return rateLimit({
    windowMs: janelaMinutos * 60 * 1000,
    limit: limite,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { erro: mensagem },
  });
}

// Limite geral para toda a API
const limiteGeral = criarLimite(
  15,
  600,
  "Muitas requisições. Tente novamente em alguns minutos."
);

// Login e cadastro: protege contra tentativa de força bruta
const limiteAutenticacao = criarLimite(
  15,
  20,
  "Muitas tentativas de acesso. Aguarde alguns minutos."
);

// Criação de registros e uploads
const limiteEscrita = criarLimite(
  15,
  100,
  "Muitas alterações em pouco tempo. Aguarde alguns minutos."
);

export { limiteGeral, limiteAutenticacao, limiteEscrita };