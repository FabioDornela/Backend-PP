import ErroHttp from "../utils/erroHttp.js";
import { verificarToken } from "../utils/gerarToken.js";
import usuarioRepository from "../repositories/usuarioRepository.js";

function lerToken(req) {
  const cabecalho = req.headers.authorization || "";
  const [tipo, token] = cabecalho.split(" ");
  return tipo === "Bearer" && token ? token : null;
}

async function identificar(token) {
  let payload;
  try {
    payload = verificarToken(token);
  } catch (erro) {
    throw new ErroHttp(401, "Sessão inválida ou expirada. Faça login novamente.");
  }

  const usuario = await usuarioRepository.buscarPorId(Number(payload.sub));
  if (!usuario) throw new ErroHttp(401, "Sessão inválida ou expirada. Faça login novamente.");
  return usuario;
}

// Rotas privadas: exige token válido. O usuário vem SEMPRE do token.
async function autenticarUsuario(req, res, next) {
  const token = lerToken(req);
  if (!token) throw new ErroHttp(401, "Faça login para continuar.");
  req.usuario = await identificar(token);
  next();
}

// Rotas públicas que mudam a resposta se houver usuário logado.
async function autenticarOpcional(req, res, next) {
  const token = lerToken(req);
  if (token) {
    try {
      req.usuario = await identificar(token);
    } catch (erro) {
      req.usuario = undefined;
    }
  }
  next();
}

export { autenticarOpcional };
export default autenticarUsuario;