import ErroHttp from "../utils/erroHttp.js";
import ongRepository from "../repositories/ongRepository.js";

// Compara textos sem diferenciar maiúsculas/minúsculas nem acentos.
function normalizar(texto) {
  return String(texto ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function formatar(ong, regioes) {
  return {
    ...ong,
    eh_demonstracao: Boolean(ong.eh_demonstracao),
    regioes: regioes.filter((r) => r.ong_id === ong.id),
  };
}

async function carregarTodas() {
  const [ongs, regioes] = await Promise.all([
    ongRepository.listarOngs(),
    ongRepository.listarRegioes(),
  ]);

  return ongs.map((ong) => formatar(ong, regioes));
}

async function listar({ cidade, estado } = {}) {
  const todas = await carregarTodas();
  const cidadeNorm = normalizar(cidade);
  const estadoNorm = normalizar(estado);

  return todas.filter((ong) => {
    const atendeCidade =
      !cidadeNorm ||
      normalizar(ong.cidade).includes(cidadeNorm) ||
      ong.regioes.some((r) =>
        normalizar(r.cidade_atendida).includes(cidadeNorm)
      );

    const atendeEstado =
      !estadoNorm || normalizar(ong.estado) === estadoNorm;

    return atendeCidade && atendeEstado;
  });
}

async function obter(id) {
  const ong = await ongRepository.buscarOng(id);

  if (!ong) {
    throw new ErroHttp(404, "ONG não encontrada.");
  }

  const regioes = await ongRepository.listarRegioesDaOng(id);

  return formatar(ong, regioes);
}

/*
 * Recomendação por pontuação:
 *  3 = a cidade está entre as regiões atendidas da ONG
 *  2 = a ONG fica na mesma cidade
 *  1 = mesmo estado
 * Sem cidade nem estado informados, nada é recomendado (lista vazia).
 */
async function recomendadas({ cidade, estado }) {
  const cidadeNorm = normalizar(cidade);
  const estadoNorm = normalizar(estado);

  if (!cidadeNorm && !estadoNorm) return [];

  const todas = await carregarTodas();

  return todas
    .map((ong) => {
      let pontos = 0;

      if (
        cidadeNorm &&
        ong.regioes.some(
          (r) => normalizar(r.cidade_atendida) === cidadeNorm
        )
      ) {
        pontos = 3;
      } else if (
        cidadeNorm &&
        normalizar(ong.cidade) === cidadeNorm
      ) {
        pontos = 2;
      } else if (
        estadoNorm &&
        (
          normalizar(ong.estado) === estadoNorm ||
          ong.regioes.some(
            (r) => normalizar(r.estado) === estadoNorm
          )
        )
      ) {
        pontos = 1;
      }

      return { ong, pontos };
    })
    .filter((item) => item.pontos > 0)
    .sort(
      (a, b) =>
        b.pontos - a.pontos ||
        a.ong.nome.localeCompare(b.ong.nome)
    )
    .map((item) => item.ong);
}

export { listar, obter, recomendadas };