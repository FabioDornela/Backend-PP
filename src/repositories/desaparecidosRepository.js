import pool from "../config/database.js";

const SELECT_CASO = `
  SELECT c.id, c.animal_id, c.tipo_ocorrencia, c.nome, c.especie, c.raca, c.sexo, c.porte, c.idade,
         c.descricao, c.foto, c.cidade, c.bairro, c.cep, c.contato,
         DATE_FORMAT(c.data_ocorrencia, '%Y-%m-%d') AS data_ocorrencia,
         c.status, c.criado_em, (c.usuario_id = ?) AS eh_meu
  FROM casos_desaparecidos c`;

function escaparLike(texto) {
  return String(texto).replace(/[\\%_]/g, "\\$&");
}

function mapear(linha) {
  return linha ? { ...linha, eh_meu: Boolean(linha.eh_meu) } : null;
}

async function listar(filtros, usuarioId = 0) {
  const condicoes = ["c.status = 'Ativo'"];
  const params = [usuarioId];

  if (filtros.tipo) {
    condicoes.push("c.tipo_ocorrencia = ?");
    params.push(filtros.tipo);
  }

  if (filtros.busca) {
    condicoes.push("(c.nome LIKE ? OR c.raca LIKE ? OR c.descricao LIKE ?)");
    const termo = `%${escaparLike(filtros.busca)}%`;
    params.push(termo, termo, termo);
  }

  if (filtros.cidade) {
    condicoes.push("c.cidade LIKE ?");
    params.push(`%${escaparLike(filtros.cidade)}%`);
  }

  if (filtros.raca) {
    condicoes.push("c.raca LIKE ?");
    params.push(`%${escaparLike(filtros.raca)}%`);
  }

  if (filtros.sexo) {
    condicoes.push("c.sexo = ?");
    params.push(filtros.sexo);
  }

  const [linhas] = await pool.query(
    `${SELECT_CASO} WHERE ${condicoes.join(" AND ")} ORDER BY c.data_ocorrencia DESC, c.id DESC`,
    params
  );

  return linhas.map(mapear);
}

async function listarMeus(usuarioId) {
  const [linhas] = await pool.query(
    `${SELECT_CASO} WHERE c.usuario_id = ? ORDER BY c.id DESC`,
    [usuarioId, usuarioId]
  );

  return linhas.map(mapear);
}

// Detalhe: casos encerrados só aparecem para o próprio dono (filtrado no service).
async function buscarPorId(id, usuarioId = 0) {
  const [linhas] = await pool.query(
    `${SELECT_CASO} WHERE c.id = ?`,
    [usuarioId, id]
  );

  return mapear(linhas[0]);
}

async function buscarBruto(id) {
  const [linhas] = await pool.query(
    "SELECT id, usuario_id, status, foto FROM casos_desaparecidos WHERE id = ?",
    [id]
  );

  return linhas[0] || null;
}

async function criar(usuarioId, d) {
  const [resultado] = await pool.query(
    `INSERT INTO casos_desaparecidos
       (usuario_id, animal_id, tipo_ocorrencia, nome, especie, raca, sexo, porte, idade,
        descricao, foto, cidade, bairro, cep, contato, data_ocorrencia)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      usuarioId,
      d.animal_id,
      d.tipo_ocorrencia,
      d.nome,
      d.especie,
      d.raca,
      d.sexo,
      d.porte,
      d.idade,
      d.descricao,
      d.foto,
      d.cidade,
      d.bairro,
      d.cep,
      d.contato,
      d.data_ocorrencia,
    ]
  );

  return resultado.insertId;
}

async function atualizar(id, d) {
  await pool.query(
    `UPDATE casos_desaparecidos
     SET animal_id = ?, tipo_ocorrencia = ?, nome = ?, especie = ?, raca = ?, sexo = ?, porte = ?,
         idade = ?, descricao = ?, foto = ?, cidade = ?, bairro = ?, cep = ?, contato = ?,
         data_ocorrencia = ?
     WHERE id = ?`,
    [
      d.animal_id,
      d.tipo_ocorrencia,
      d.nome,
      d.especie,
      d.raca,
      d.sexo,
      d.porte,
      d.idade,
      d.descricao,
      d.foto,
      d.cidade,
      d.bairro,
      d.cep,
      d.contato,
      d.data_ocorrencia,
      id,
    ]
  );
}

async function encerrar(id) {
  await pool.query(
    "UPDATE casos_desaparecidos SET status = 'Encerrado' WHERE id = ?",
    [id]
  );
}

export {
  listar,
  listarMeus,
  buscarPorId,
  buscarBruto,
  criar,
  atualizar,
  encerrar,
};