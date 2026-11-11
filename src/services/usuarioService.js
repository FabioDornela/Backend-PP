const ErroHttp = require("../utils/erroHttp");
const usuarioRepository = require("../repositories/usuarioRepository");

async function obterPerfil(usuarioId) {
  const usuario = await usuarioRepository.buscarPorId(usuarioId);
  if (!usuario) throw new ErroHttp(404, "Usuário não encontrado.");
  return usuario;
}

async function atualizarPerfil(usuarioId, dados) {
  if (await usuarioRepository.emailEmUso(dados.email, usuarioId)) {
    throw new ErroHttp(409, "Este e-mail já está em uso por outra conta.");
  }

  await usuarioRepository.atualizarPerfil(usuarioId, {
    nome: dados.nome,
    email: dados.email,
    telefone: dados.telefone ?? null,
    cep: dados.cep ?? null,
    rua: dados.rua ?? null,
    numero: dados.numero ?? null,
    complemento: dados.complemento ?? null,
    bairro: dados.bairro ?? null,
    cidade: dados.cidade ?? null,
    estado: dados.estado ?? null,
    sobre: dados.sobre ?? null,
  });

  return obterPerfil(usuarioId);
}

module.exports = { obterPerfil, atualizarPerfil };
