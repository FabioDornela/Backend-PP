const pool = require("../config/database");

const CAMPOS_PUBLICOS =
  "id, nome, email, telefone, cep, rua, numero, complemento, bairro, cidade, estado, sobre";

// Nunca retorna o hash da senha.
async function buscarPorId(id) {
  const [linhas] = await pool.query(`SELECT ${CAMPOS_PUBLICOS} FROM usuarios WHERE id = ?`, [id]);
  return linhas[0] || null;
}

// Único método que devolve o hash: usado apenas na verificação de login.
async function buscarPorEmailComSenha(email) {
  const [linhas] = await pool.query(
    "SELECT id, senha_hash FROM usuarios WHERE email = ?",
    [email]
  );
  return linhas[0] || null;
}

async function emailEmUso(email, ignorarId = 0) {
  const [linhas] = await pool.query(
    "SELECT id FROM usuarios WHERE email = ? AND id <> ?",
    [email, ignorarId]
  );
  return linhas.length > 0;
}

async function criar({ nome, email, senhaHash, telefone }) {
  const [resultado] = await pool.query(
    "INSERT INTO usuarios (nome, email, senha_hash, telefone) VALUES (?, ?, ?, ?)",
    [nome, email, senhaHash, telefone || null]
  );
  return resultado.insertId;
}

async function atualizarPerfil(id, dados) {
  await pool.query(
    `UPDATE usuarios
     SET nome = ?, email = ?, telefone = ?, cep = ?, rua = ?, numero = ?,
         complemento = ?, bairro = ?, cidade = ?, estado = ?, sobre = ?
     WHERE id = ?`,
    [
      dados.nome,
      dados.email,
      dados.telefone,
      dados.cep,
      dados.rua,
      dados.numero,
      dados.complemento,
      dados.bairro,
      dados.cidade,
      dados.estado,
      dados.sobre,
      id,
    ]
  );
}

module.exports = { buscarPorId, buscarPorEmailComSenha, emailEmUso, criar, atualizarPerfil };
