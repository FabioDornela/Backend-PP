import ongService from "../services/ongService.js";
import lerFiltros from "../utils/lerFiltros.js";

async function listar(req, res) {
  res.json(await ongService.listar(lerFiltros(req.query, ["cidade", "estado"])));
}

async function recomendadas(req, res) {
  res.json(await ongService.recomendadas(lerFiltros(req.query, ["cidade", "estado"])));
}

async function obter(req, res) {
  res.json(await ongService.obter(Number(req.params.id)));
}

export default { listar, recomendadas, obter };