const authService = require("../services/authService");

async function cadastro(req, res) {
  const resultado = await authService.cadastrar(req.body);
  res.status(201).json(resultado);
}

async function login(req, res) {
  res.json(await authService.entrar(req.body));
}

async function me(req, res) {
  res.json(req.usuario);
}

module.exports = { cadastro, login, me };
