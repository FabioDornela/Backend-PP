import desaparecidosService from "../services/desaparecidosService.js";
import lerFiltros from "../utils/lerFiltros.js";

async function listar(req, res) {
  const filtros = lerFiltros(req.query, ["tipo", "busca", "cidade", "raca", "sexo"]);
  res.json(await desaparecidosService.listar(filtros, req.usuario));
}

async function listarMeus(req, res) {
  res.json(await desaparecidosService.listarMeus(req.usuario));
}

async function obter(req, res) {
  res.json(await desaparecidosService.obter(Number(req.params.id), req.usuario));
}

async function criar(req, res) {
  res.status(201).json(await desaparecidosService.criar(req.usuario, req.body, req.file));
}

async function atualizar(req, res) {
  res.json(
    await desaparecidosService.atualizar(req.usuario, Number(req.params.id), req.body, req.file)
  );
}

async function encerrar(req, res) {
  res.json(await desaparecidosService.encerrar(req.usuario, Number(req.params.id)));
}

export default { listar, listarMeus, obter, criar, atualizar, encerrar };