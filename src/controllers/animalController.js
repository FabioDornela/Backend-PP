const animalService = require("../services/animalService");
const lerFiltros = require("../utils/lerFiltros");

async function listar(req, res) {
  const filtros = lerFiltros(req.query, ["busca", "cidade", "raca", "porte", "sexo", "especie"]);
  res.json(await animalService.listarDisponiveis(filtros, req.usuario));
}

async function listarMeus(req, res) {
  res.json(await animalService.listarMeus(req.usuario));
}

async function obter(req, res) {
  res.json(await animalService.obter(Number(req.params.id), req.usuario));
}

async function criar(req, res) {
  res.status(201).json(await animalService.criar(req.usuario, req.body, req.file));
}

async function atualizar(req, res) {
  res.json(await animalService.atualizar(req.usuario, Number(req.params.id), req.body, req.file));
}

async function excluir(req, res) {
  await animalService.excluir(req.usuario, Number(req.params.id));
  res.status(204).end();
}

async function atualizarStatus(req, res) {
  res.json(await animalService.atualizarStatus(req.usuario, Number(req.params.id), req.body.status));
}

module.exports = { listar, listarMeus, obter, criar, atualizar, excluir, atualizarStatus };
