const mysql = require("mysql2/promise");
const { env } = require("./env");

const pool = mysql.createPool({
    host: env.db.host,
    port: env.db.port,
    user: env.db.user,
    password: env.db.password,
    database: env.db.database,
    waitForConnections: true,
    connectionLimit: 10,
    charset: "utf8mb4",
});


// Ordem respeita as dependências entre chaves estrangeiras.
const TABELAS = [
  `CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(120) NOT NULL,
    email VARCHAR(150) NOT NULL,
    senha_hash VARCHAR(100) NOT NULL,
    telefone VARCHAR(25),
    cep VARCHAR(8),
    rua VARCHAR(150),
    numero VARCHAR(20),
    complemento VARCHAR(80),
    bairro VARCHAR(100),
    cidade VARCHAR(100),
    estado CHAR(2),
    sobre TEXT,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_usuarios_email (email)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

  `CREATE TABLE IF NOT EXISTS animais (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    nome VARCHAR(80) NOT NULL,
    especie VARCHAR(30) NOT NULL DEFAULT 'Cachorro',
    raca VARCHAR(80),
    sexo VARCHAR(10),
    idade VARCHAR(30),
    porte VARCHAR(20),
    peso VARCHAR(20),
    cidade VARCHAR(100),
    bairro VARCHAR(100),
    cep VARCHAR(8),
    status VARCHAR(40) NOT NULL DEFAULT 'Comigo',
    descricao TEXT,
    imagem VARCHAR(500),
    ativo TINYINT(1) NOT NULL DEFAULT 1,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    KEY idx_animais_usuario (usuario_id),
    KEY idx_animais_status (status, ativo),
    KEY idx_animais_cidade (cidade),
    CONSTRAINT fk_animais_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

  `CREATE TABLE IF NOT EXISTS casos_desaparecidos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    animal_id INT NULL,
    tipo_ocorrencia VARCHAR(20) NOT NULL DEFAULT 'Desaparecido',
    nome VARCHAR(80) NOT NULL,
    especie VARCHAR(30),
    raca VARCHAR(80),
    sexo VARCHAR(10),
    porte VARCHAR(20),
    idade VARCHAR(30),
    descricao TEXT,
    foto VARCHAR(500),
    cidade VARCHAR(100),
    bairro VARCHAR(100),
    cep VARCHAR(8),
    contato VARCHAR(120),
    data_ocorrencia DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'Ativo',
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    KEY idx_casos_usuario (usuario_id),
    KEY idx_casos_status (status, tipo_ocorrencia),
    KEY idx_casos_cidade (cidade),
    CONSTRAINT fk_casos_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE CASCADE,
    CONSTRAINT fk_casos_animal FOREIGN KEY (animal_id) REFERENCES animais (id) ON DELETE SET NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

  `CREATE TABLE IF NOT EXISTS ongs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    descricao TEXT,
    telefone VARCHAR(40),
    email VARCHAR(150),
    cidade VARCHAR(100),
    estado CHAR(2),
    endereco VARCHAR(200),
    site VARCHAR(200),
    informacoes_atendimento TEXT,
    eh_demonstracao TINYINT(1) NOT NULL DEFAULT 0,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    KEY idx_ongs_cidade (cidade, estado)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

  `CREATE TABLE IF NOT EXISTS ong_regioes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ong_id INT NOT NULL,
    cidade_atendida VARCHAR(100) NOT NULL,
    regiao_atendida VARCHAR(200),
    estado CHAR(2),
    KEY idx_regioes_cidade (cidade_atendida),
    CONSTRAINT fk_regioes_ong FOREIGN KEY (ong_id) REFERENCES ongs (id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

  `CREATE TABLE IF NOT EXISTS interesses_adocao (
    id INT AUTO_INCREMENT PRIMARY KEY,
    animal_id INT NOT NULL,
    usuario_id INT NOT NULL,
    mensagem VARCHAR(500),
    status VARCHAR(20) NOT NULL DEFAULT 'Pendente',
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_interesse_animal_usuario (animal_id, usuario_id),
    KEY idx_interesses_usuario (usuario_id),
    CONSTRAINT fk_interesses_animal FOREIGN KEY (animal_id) REFERENCES animais (id) ON DELETE CASCADE,
    CONSTRAINT fk_interesses_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
];

// Colunas que podem faltar em bancos criados por versões anteriores do projeto.
// Só adiciona o que não existe; nunca apaga nem altera dados.
const COLUNAS_COMPLEMENTARES = [
  ["usuarios", "atualizado_em", "TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"],
  ["animais", "bairro", "VARCHAR(100)"],
  ["animais", "cep", "VARCHAR(8)"],
  ["animais", "atualizado_em", "TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"],
  ["casos_desaparecidos", "animal_id", "INT NULL"],
  ["casos_desaparecidos", "cep", "VARCHAR(8)"],
  ["casos_desaparecidos", "atualizado_em", "TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"],
  ["ongs", "informacoes_atendimento", "TEXT"],
  ["ongs", "criado_em", "TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP"],
  ["ong_regioes", "estado", "CHAR(2)"],
];

async function garantirColuna(tabela, coluna, definicao) {
  const [existe] = await pool.query(
    `SELECT 1 FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    [env.db.database, tabela, coluna]
  );
  if (!existe.length) {
    await pool.query(`ALTER TABLE \`${tabela}\` ADD COLUMN \`${coluna}\` ${definicao}`);
  }
}

// Cria o banco (se o usuário MySQL tiver permissão) e testa a conexão.
async function prepararBanco() {
  try {
    const conexao = await mysql.createConnection({
      host: env.db.host,
      port: env.db.port,
      user: env.db.user,
      password: env.db.password,
    });
    await conexao.query(
      `CREATE DATABASE IF NOT EXISTS \`${env.db.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
    await conexao.end();
  } catch (erro) {
    throw new Error(
      `Não foi possível conectar ao MySQL em ${env.db.host}:${env.db.port} com o usuário "${env.db.user}" ` +
        `(${erro.code || erro.message}).\n` +
        "Verifique se o MySQL está ligado e se DB_HOST, DB_PORT, DB_USER e DB_PASSWORD estão corretos em backend/.env."
    );
  }
}

async function criarTabelas() {
  for (const comando of TABELAS) {
    await pool.query(comando);
  }
  for (const [tabela, coluna, definicao] of COLUNAS_COMPLEMENTARES) {
    await garantirColuna(tabela, coluna, definicao);
  }
}

async function inicializarBanco() {
  await prepararBanco();
  await criarTabelas();
}

pool.inicializarBanco = inicializarBanco;
module.exports = pool;

