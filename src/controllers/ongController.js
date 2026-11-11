const ongService = require("../services/ongService");
const lerFiltros = require("../utils/lerFiltros");

async function listar(req, res) {
  res.json(await ongService.listar(lerFiltros(req.query, ["cidade", "estado"])));
}

async function recomendadas(req, res) {
  res.json(await ongService.recomendadas(lerFiltros(req.query, ["cidade", "estado"])));
}

async function obter(req, res) {
  res.json(await ongService.obter(Number(req.params.id)));
}

module.exports = { listar, recomendadas, obter };
