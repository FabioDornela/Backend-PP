const ErroHttp = require("../utils/erroHttp");
const { caminhoPublico, removerImagem } = require("../utils/arquivos");
const desaparecidosRepository = require("../repositories/desaparecidosRepository");
const animalRepository = require("../repositories/animalRepository");

function hojeISO() {
  const agora = new Date();
  const mes = String(agora.getMonth() + 1).padStart(2, "0");
  const dia = String(agora.getDate()).padStart(2, "0");
  return `${agora.getFullYear()}-${mes}-${dia}`;
}

async function camposDoCaso(usuario, dados, foto) {
  if (dados.data_ocorrencia > hojeISO()) {
    throw new ErroHttp(400, "Dados inválidos.", {
      data_ocorrencia: "A data da ocorrência não pode estar no futuro.",
    });
  }

  // Se vinculado a um animal cadastrado, ele precisa ser do próprio usuário.
  let animalId = null;
  if (dados.animal_id) {
    const animal = await animalRepository.buscarBruto(dados.animal_id);
    if (!animal || animal.usuario_id !== usuario.id) {
      throw new ErroHttp(400, "Dados inválidos.", {
        animal_id: "Animal não encontrado entre os seus cadastros.",
      });
    }
    animalId = animal.id;
  }

  return {
    animal_id: animalId,
    tipo_ocorrencia: dados.tipo_ocorrencia,
    nome: dados.nome,
    especie: dados.especie ?? null,
    raca: dados.raca ?? null,
    sexo: dados.sexo ?? null,
    porte: dados.porte ?? null,
    idade: dados.idade ?? null,
    descricao: dados.descricao ?? null,
    foto,
    cidade: dados.cidade ?? null,
    bairro: dados.bairro ?? null,
    cep: dados.cep ?? null,
    contato: dados.contato,
    data_ocorrencia: dados.data_ocorrencia,
  };
}

async function exigirDono(id, usuarioId) {
  const caso = await desaparecidosRepository.buscarBruto(id);
  if (!caso) throw new ErroHttp(404, "Ocorrência não encontrada.");
  if (caso.usuario_id !== usuarioId) {
    throw new ErroHttp(403, "Você não tem permissão para alterar esta ocorrência.");
  }
  return caso;
}

function listar(filtros, usuario) {
  return desaparecidosRepository.listar(filtros, usuario?.id || 0);
}

function listarMeus(usuario) {
  return desaparecidosRepository.listarMeus(usuario.id);
}

// Ocorrências encerradas só aparecem para quem as registrou.
async function obter(id, usuario) {
  const caso = await desaparecidosRepository.buscarPorId(id, usuario?.id || 0);
  if (!caso || (caso.status !== "Ativo" && !caso.eh_meu)) {
    throw new ErroHttp(404, "Ocorrência não encontrada.");
  }
  return caso;
}

async function criar(usuario, dados, arquivo) {
  const campos = await camposDoCaso(usuario, dados, caminhoPublico(arquivo) ?? null);
  const id = await desaparecidosRepository.criar(usuario.id, campos);
  return desaparecidosRepository.buscarPorId(id, usuario.id);
}

async function atualizar(usuario, id, dados, arquivo) {
  const atual = await exigirDono(id, usuario.id);
  if (atual.status !== "Ativo") {
    throw new ErroHttp(400, "Ocorrências encerradas não podem ser editadas.");
  }

  let foto = atual.foto;
  if (arquivo) foto = caminhoPublico(arquivo);
  else if (dados.remover_foto === "true") foto = null;

  const campos = await camposDoCaso(usuario, dados, foto);
  await desaparecidosRepository.atualizar(id, campos);
  if (foto !== atual.foto) removerImagem(atual.foto);

  return desaparecidosRepository.buscarPorId(id, usuario.id);
}

async function encerrar(usuario, id) {
  const atual = await exigirDono(id, usuario.id);
  if (atual.status !== "Ativo") throw new ErroHttp(400, "Esta ocorrência já foi encerrada.");

  await desaparecidosRepository.encerrar(id);
  return desaparecidosRepository.buscarPorId(id, usuario.id);
}

module.exports = { listar, listarMeus, obter, criar, atualizar, encerrar };
