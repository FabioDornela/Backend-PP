const pool = require("../config/database");

async function buscarInteresse(animalId, usuarioId) {
  const [linhas] = await pool.query(
    "SELECT id, status FROM interesses_adocao WHERE animal_id = ? AND usuario_id = ?",
    [animalId, usuarioId]
  );
  return linhas[0] || null;
}

// Traz também o dono do animal para a verificação de autorização.
async function buscarInteressePorId(id) {
  const [linhas] = await pool.query(
    `SELECT i.id, i.status, i.usuario_id, i.animal_id, a.usuario_id AS dono_id, a.ativo AS animal_ativo
     FROM interesses_adocao i
     JOIN animais a ON a.id = i.animal_id
     WHERE i.id = ?`,
    [id]
  );
  return linhas[0] || null;
}

async function criar(animalId, usuarioId, mensagem) {
  const [resultado] = await pool.query(
    "INSERT INTO interesses_adocao (animal_id, usuario_id, mensagem) VALUES (?, ?, ?)",
    [animalId, usuarioId, mensagem || null]
  );
  return resultado.insertId;
}

// Usuário que tinha cancelado volta a manifestar interesse no mesmo animal.
async function reabrir(id, mensagem) {
  await pool.query(
    "UPDATE interesses_adocao SET status = 'Pendente', mensagem = ? WHERE id = ?",
    [mensagem || null, id]
  );
}

async function atualizarStatus(id, status) {
  await pool.query("UPDATE interesses_adocao SET status = ? WHERE id = ?", [status, id]);
}

async function buscarDetalhado(id) {
  const [linhas] = await pool.query(
    `SELECT i.id, i.animal_id, i.mensagem, i.status, i.criado_em, i.atualizado_em
     FROM interesses_adocao i WHERE i.id = ?`,
    [id]
  );
  return linhas[0] || null;
}

async function listarPorUsuario(usuarioId) {
  const [linhas] = await pool.query(
    `SELECT i.id, i.mensagem, i.status, i.criado_em, i.atualizado_em,
            a.id AS animal_id, a.nome AS animal_nome, a.imagem AS animal_imagem,
            a.cidade AS animal_cidade, a.status AS animal_status, u.nome AS tutor_nome
     FROM interesses_adocao i
     JOIN animais a ON a.id = i.animal_id
     JOIN usuarios u ON u.id = a.usuario_id
     WHERE i.usuario_id = ? AND a.ativo = 1
     ORDER BY i.id DESC`,
    [usuarioId]
  );
  return linhas;
}

// Contato do interessado só é exposto ao dono do animal (checado no service).
async function listarPorAnimal(animalId) {
  const [linhas] = await pool.query(
    `SELECT i.id, i.mensagem, i.status, i.criado_em,
            u.nome AS interessado_nome, u.email AS interessado_email,
            u.telefone AS interessado_telefone, u.cidade AS interessado_cidade,
            u.estado AS interessado_estado
     FROM interesses_adocao i
     JOIN usuarios u ON u.id = i.usuario_id
     WHERE i.animal_id = ?
     ORDER BY i.id DESC`,
    [animalId]
  );
  return linhas;
}

module.exports = {
  buscarInteresse,
  buscarInteressePorId,
  buscarDetalhado,
  criar,
  reabrir,
  atualizarStatus,
  listarPorUsuario,
  listarPorAnimal,
};
