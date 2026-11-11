const ErroHttp = require("../utils/erroHttp");
const animalRepository = require("../repositories/animalRepository");
const adocaoRepository = require("../repositories/adocaoRepository");

/*
 * Regra: cada usuário tem no máximo UM interesse por animal.
 * Se o interesse anterior foi cancelado, ele pode ser reaberto; nos demais status, é duplicado.
 * Manifestar interesse nunca altera o status do animal.
 */
async function manifestarInteresse(usuario, { animal_id: animalId, mensagem }) {
  const animal = await animalRepository.buscarBruto(animalId);
  if (!animal || animal.status !== animalRepository.STATUS_ADOCAO) {
    throw new ErroHttp(404, "Animal não encontrado ou indisponível para adoção.");
  }
  if (animal.usuario_id === usuario.id) {
    throw new ErroHttp(400, "Você não pode manifestar interesse no seu próprio animal.");
  }

  const existente = await adocaoRepository.buscarInteresse(animalId, usuario.id);
  let interesseId;

  if (existente) {
    if (existente.status !== "Cancelado") {
      throw new ErroHttp(409, "Você já manifestou interesse neste animal.");
    }
    await adocaoRepository.reabrir(existente.id, mensagem);
    interesseId = existente.id;
  } else {
    interesseId = await adocaoRepository.criar(animalId, usuario.id, mensagem);
  }

  return adocaoRepository.buscarDetalhado(interesseId);
}

function meusInteresses(usuario) {
  return adocaoRepository.listarPorUsuario(usuario.id);
}

async function interessesDoAnimal(usuario, animalId) {
  const animal = await animalRepository.buscarBruto(animalId);
  if (!animal) throw new ErroHttp(404, "Animal não encontrado.");
  if (animal.usuario_id !== usuario.id) {
    throw new ErroHttp(403, "Apenas o responsável pelo animal pode ver os interesses recebidos.");
  }
  return adocaoRepository.listarPorAnimal(animalId);
}

async function atualizarStatus(usuario, interesseId, status) {
  const interesse = await adocaoRepository.buscarInteressePorId(interesseId);
  if (!interesse || !interesse.animal_ativo) throw new ErroHttp(404, "Interesse não encontrado.");

  const ehDono = interesse.dono_id === usuario.id;
  const ehInteressado = interesse.usuario_id === usuario.id;
  if (!ehDono && !ehInteressado) {
    throw new ErroHttp(403, "Você não tem permissão para alterar este interesse.");
  }

  if (status === "Cancelado") {
    // Apenas quem manifestou o interesse pode cancelá-lo.
    if (!ehInteressado) throw new ErroHttp(403, "Apenas o interessado pode cancelar o interesse.");
    if (!["Pendente", "Aceito"].includes(interesse.status)) {
      throw new ErroHttp(400, "Este interesse não pode mais ser cancelado.");
    }
  } else {
    // Aceitar, recusar ou voltar para pendente: só o responsável pelo animal.
    if (!ehDono) throw new ErroHttp(403, "Apenas o responsável pelo animal pode analisar o interesse.");
    if (interesse.status === "Cancelado") {
      throw new ErroHttp(400, "Este interesse foi cancelado pelo interessado.");
    }
  }

  await adocaoRepository.atualizarStatus(interesseId, status);
  return adocaoRepository.buscarDetalhado(interesseId);
}

module.exports = { manifestarInteresse, meusInteresses, interessesDoAnimal, atualizarStatus };
