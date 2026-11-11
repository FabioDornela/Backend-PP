const adocaoService = require("../services/adocaoService");

async function manifestarInteresse(req, res) {
  res.status(201).json(await adocaoService.manifestarInteresse(req.usuario, req.body));
}

async function meusInteresses(req, res) {
  res.json(await adocaoService.meusInteresses(req.usuario));
}

async function interessesDoAnimal(req, res) {
  res.json(await adocaoService.interessesDoAnimal(req.usuario, Number(req.params.id)));
}

async function atualizarStatus(req, res) {
  res.json(
    await adocaoService.atualizarStatus(req.usuario, Number(req.params.id), req.body.status)
  );
}

module.exports = { manifestarInteresse, meusInteresses, interessesDoAnimal, atualizarStatus };
