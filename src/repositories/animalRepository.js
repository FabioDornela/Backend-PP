const pool = require("../config/database");

const STATUS_ADOCAO = "Disponível para adoção";

const SELECT_ANIMAL = `
  SELECT a.id, a.nome, a.especie, a.raca, a.sexo, a.idade, a.porte, a.peso,
         a.cidade, a.bairro, a.cep, a.status, a.descricao, a.imagem, a.criado_em,
         u.nome AS tutor_nome, (a.usuario_id = ?) AS eh_meu
  FROM animais a
  JOIN usuarios u ON u.id = a.usuario_id`;

function escaparLike(texto) {
  return String(texto).replace(/[\\%_]/g, "\\$&");
}

function mapear(linha) {
  return linha ? { ...linha, eh_meu: Boolean(linha.eh_meu) } : null;
}

async function listarDisponiveis(filtros, usuarioId = 0) {
  const condicoes = ["a.ativo = 1", "a.status = ?"];
  const params = [usuarioId, STATUS_ADOCAO];

  if (filtros.busca) {
    condicoes.push("(a.nome LIKE ? OR a.raca LIKE ?)");
    const termo = `%${escaparLike(filtros.busca)}%`;
    params.push(termo, termo);
  }
  if (filtros.cidade) {
    condicoes.push("a.cidade LIKE ?");
    params.push(`%${escaparLike(filtros.cidade)}%`);
  }
  if (filtros.raca) {
    condicoes.push("a.raca LIKE ?");
    params.push(`%${escaparLike(filtros.raca)}%`);
  }
  if (filtros.porte) {
    condicoes.push("a.porte = ?");
    params.push(filtros.porte);
  }
  if (filtros.sexo) {
    condicoes.push("a.sexo = ?");
    params.push(filtros.sexo);
  }
  if (filtros.especie) {
    condicoes.push("a.especie = ?");
    params.push(filtros.especie);
  }

  let sql = `${SELECT_ANIMAL} WHERE ${condicoes.join(" AND ")} ORDER BY a.id DESC`;
  if (filtros.limite) {
    sql += " LIMIT ?";
    params.push(filtros.limite);
  }

  const [linhas] = await pool.query(sql, params);
  return linhas.map(mapear);
}

async function listarMeus(usuarioId) {
  const [linhas] = await pool.query(
    `${SELECT_ANIMAL} WHERE a.usuario_id = ? AND a.ativo = 1 ORDER BY a.id DESC`,
    [usuarioId, usuarioId]
  );
  return linhas.map(mapear);
}

async function buscarPorId(id, usuarioId = 0) {
  const [linhas] = await pool.query(`${SELECT_ANIMAL} WHERE a.id = ? AND a.ativo = 1`, [usuarioId, id]);
  return mapear(linhas[0]);
}

// Uso interno dos services (verificação de dono): inclui usuario_id.
async function buscarBruto(id) {
  const [linhas] = await pool.query(
    "SELECT id, usuario_id, status, imagem FROM animais WHERE id = ? AND ativo = 1",
    [id]
  );
  return linhas[0] || null;
}

async function criar(usuarioId, d) {
  const [resultado] = await pool.query(
    `INSERT INTO animais
       (usuario_id, nome, especie, raca, sexo, idade, porte, peso, cidade, bairro, cep, status, descricao, imagem)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      usuarioId,
      d.nome,
      d.especie,
      d.raca,
      d.sexo,
      d.idade,
      d.porte,
      d.peso,
      d.cidade,
      d.bairro,
      d.cep,
      d.status,
      d.descricao,
      d.imagem,
    ]
  );
  return resultado.insertId;
}

async function atualizar(id, d) {
  await pool.query(
    `UPDATE animais
     SET nome = ?, especie = ?, raca = ?, sexo = ?, idade = ?, porte = ?, peso = ?,
         cidade = ?, bairro = ?, cep = ?, status = ?, descricao = ?, imagem = ?
     WHERE id = ?`,
    [
      d.nome,
      d.especie,
      d.raca,
      d.sexo,
      d.idade,
      d.porte,
      d.peso,
      d.cidade,
      d.bairro,
      d.cep,
      d.status,
      d.descricao,
      d.imagem,
      id,
    ]
  );
}

async function atualizarStatus(id, status) {
  await pool.query("UPDATE animais SET status = ? WHERE id = ?", [status, id]);
}

// Exclusão lógica: preserva o histórico e cancela interesses ainda em aberto.
async function desativar(id) {
  const conexao = await pool.getConnection();
  try {
    await conexao.beginTransaction();
    await conexao.query("UPDATE animais SET ativo = 0 WHERE id = ?", [id]);
    await conexao.query(
      "UPDATE interesses_adocao SET status = 'Cancelado' WHERE animal_id = ? AND status = 'Pendente'",
      [id]
    );
    await conexao.commit();
  } catch (erro) {
    await conexao.rollback();
    throw erro;
  } finally {
    conexao.release();
  }
}

module.exports = {
  STATUS_ADOCAO,
  listarDisponiveis,
  listarMeus,
  buscarPorId,
  buscarBruto,
  criar,
  atualizar,
  atualizarStatus,
  desativar,
};
