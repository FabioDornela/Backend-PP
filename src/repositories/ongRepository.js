const pool = require("../config/database");

async function listarOngs() {
  const [linhas] = await pool.query("SELECT * FROM ongs ORDER BY nome");
  return linhas;
}

async function buscarOng(id) {
  const [linhas] = await pool.query("SELECT * FROM ongs WHERE id = ?", [id]);
  return linhas[0] || null;
}

async function listarRegioes() {
  const [linhas] = await pool.query(
    "SELECT ong_id, cidade_atendida, regiao_atendida, estado FROM ong_regioes ORDER BY id"
  );
  return linhas;
}

async function listarRegioesDaOng(ongId) {
  const [linhas] = await pool.query(
    "SELECT ong_id, cidade_atendida, regiao_atendida, estado FROM ong_regioes WHERE ong_id = ? ORDER BY id",
    [ongId]
  );
  return linhas;
}

module.exports = { listarOngs, buscarOng, listarRegioes, listarRegioesDaOng };
