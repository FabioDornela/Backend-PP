import usuarioService from "../services/usuarioService.js";

// O usuário é sempre o do token (req.usuario), nunca um id enviado pelo cliente.
async function obterPerfil(req, res) {
  res.json(await usuarioService.obterPerfil(req.usuario.id));
}

async function atualizarPerfil(req, res) {
  res.json(await usuarioService.atualizarPerfil(req.usuario.id, req.body));
}

export default { obterPerfil, atualizarPerfil };