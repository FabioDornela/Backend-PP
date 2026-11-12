import ErroHttp from "../utils/erroHttp.js";
import { caminhoPublico, removerImagem } from "../utils/arquivos.js";
import animalRepository from "../repositories/animalRepository.js";

function camposDoAnimal(dados, imagem) {
  return {
    nome: dados.nome,
    especie: dados.especie || "Cachorro",
    raca: dados.raca ?? null,
    sexo: dados.sexo ?? null,
    idade: dados.idade ?? null,
    porte: dados.porte ?? null,
    peso: dados.peso ?? null,
    cidade: dados.cidade ?? null,
    bairro: dados.bairro ?? null,
    cep: dados.cep ?? null,
    status: dados.status || "Comigo",
    descricao: dados.descricao ?? null,
    imagem,
  };
}

// Garante que o animal existe e pertence ao usuário autenticado.
async function exigirDono(id, usuarioId) {
  const animal = await animalRepository.buscarBruto(id);

  if (!animal) {
    throw new ErroHttp(404, "Animal não encontrado.");
  }

  if (animal.usuario_id !== usuarioId) {
    throw new ErroHttp(
      403,
      "Você não tem permissão para alterar este animal."
    );
  }

  return animal;
}

function listarDisponiveis(filtros, usuario) {
  return animalRepository.listarDisponiveis(filtros, usuario?.id || 0);
}

function listarMeus(usuario) {
  return animalRepository.listarMeus(usuario.id);
}

// Animais fora da adoção só podem ser vistos pelo próprio tutor.
async function obter(id, usuario) {
  const animal = await animalRepository.buscarPorId(
    id,
    usuario?.id || 0
  );

  if (
    !animal ||
    (
      animal.status !== animalRepository.STATUS_ADOCAO &&
      !animal.eh_meu
    )
  ) {
    throw new ErroHttp(404, "Animal não encontrado.");
  }

  return animal;
}

async function criar(usuario, dados, arquivo) {
  const id = await animalRepository.criar(
    usuario.id,
    camposDoAnimal(dados, caminhoPublico(arquivo) ?? null)
  );

  return animalRepository.buscarPorId(id, usuario.id);
}

async function atualizar(usuario, id, dados, arquivo) {
  const atual = await exigirDono(id, usuario.id);

  let imagem = atual.imagem;

  if (arquivo) {
    imagem = caminhoPublico(arquivo);
  } else if (dados.remover_foto === "true") {
    imagem = null;
  }

  await animalRepository.atualizar(
    id,
    camposDoAnimal(dados, imagem)
  );

  if (imagem !== atual.imagem) {
    removerImagem(atual.imagem);
  }

  return animalRepository.buscarPorId(id, usuario.id);
}

async function excluir(usuario, id) {
  await exigirDono(id, usuario.id);
  await animalRepository.desativar(id);
}

async function atualizarStatus(usuario, id, status) {
  await exigirDono(id, usuario.id);

  await animalRepository.atualizarStatus(id, status);

  return animalRepository.buscarPorId(id, usuario.id);
}

export {
  listarDisponiveis,
  listarMeus,
  obter,
  criar,
  atualizar,
  excluir,
  atualizarStatus,
};

export default {
  listarDisponiveis,
  listarMeus,
  obter,
  criar,
  atualizar,
  excluir,
  atualizarStatus,
};