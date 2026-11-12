import bcrypt from "bcryptjs";
import ErroHttp from "../utils/erroHttp.js";
import { gerarToken } from "../utils/gerarToken.js";
import usuarioRepository from "../repositories/usuarioRepository.js";

const CUSTO_HASH = 10;

// Hash falso usado para gastar o mesmo tempo quando o e-mail não existe (evita revelar contas).
const HASH_FALSO = bcrypt.hashSync("senha-inexistente", CUSTO_HASH);

async function cadastrar({ nome, email, senha, telefone }) {
  if (await usuarioRepository.emailEmUso(email)) {
    throw new ErroHttp(409, "Já existe uma conta com este e-mail.");
  }

  const senhaHash = await bcrypt.hash(senha, CUSTO_HASH);

  const id = await usuarioRepository.criar({
    nome,
    email,
    senhaHash,
    telefone,
  });

  const usuario = await usuarioRepository.buscarPorId(id);

  return {
    token: gerarToken(id),
    usuario,
  };
}

async function entrar({ email, senha }) {
  const registro = await usuarioRepository.buscarPorEmailComSenha(email);

  const senhaConfere = await bcrypt.compare(
    senha,
    registro ? registro.senha_hash : HASH_FALSO
  );

  // Mesma mensagem para e-mail inexistente e senha errada.
  if (!registro || !senhaConfere) {
    throw new ErroHttp(401, "E-mail ou senha inválidos.");
  }

  const usuario = await usuarioRepository.buscarPorId(registro.id);

  return {
    token: gerarToken(registro.id),
    usuario,
  };
}

export { cadastrar, entrar };
export default { cadastrar, entrar };