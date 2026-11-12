import authService from "../services/authService.js";

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

export default { cadastro, login, me };