/*
 * Dados de demonstração OPCIONAIS. Não roda junto com o backend.
 * Execute apenas se quiser popular o banco para testar:   npm run seed --prefix backend
 *
 * É seguro rodar mais de uma vez: só insere o que ainda não existe e nunca altera ou apaga dados.
 * Usuário demo: demo@portalpet.local  |  senha: 123456
 */
const bcrypt = require("bcryptjs");
const pool = require("../../src/config/database");
const { inicializarBanco } = require("../../src/config/database");

const EMAIL_DEMO = "demo@portalpet.local";

const ANIMAIS = [
  ["Thor", "Cachorro", "Golden Retriever", "Macho", "3 anos", "Grande", "32 kg", "São Paulo", "Disponível para adoção", "Thor é um cachorro muito brincalhão e cheio de energia. Adora correr em parques e brincar com bolinhas. É muito carinhoso com crianças e se dá bem com outros animais. Vacinado e castrado.", "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=600&q=85"],
  ["Mia", "Gato", "Gato SRD", "Fêmea", "1,5 anos", "Pequeno", "4 kg", "Campinas", "Disponível para adoção", "Mia é uma gatinha calma, limpa e carinhosa. Adora um cantinho ensolarado para tirar um cochilo.", "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=600&q=85"],
  ["Bob", "Cachorro", "Jack Russell", "Macho", "3 meses", "Pequeno", "6 kg", "São Paulo", "Disponível para adoção", "Bob é curioso, esperto e adorável. Precisa de uma família que goste de fazer passeios ao ar livre.", "https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=600&q=85"],
  ["Luna", "Cachorro", "Golden Retriever", "Fêmea", "4 anos", "Grande", "28 kg", "Santos", "Disponível para adoção", "Luna é super dócil, tranquila e ama fazer companhia. Já está adestrada e convive super bem em apartamentos.", "https://images.unsplash.com/photo-1633722715463-d30f4f325e24?auto=format&fit=crop&w=600&q=85"],
  ["Toby", "Cachorro", "SRD", "Macho", "3 meses", "Pequeno", "5 kg", "Campinas", "Disponível para adoção", "Filhote resgatado saudável, vacinado e muito companheiro.", "https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?auto=format&fit=crop&w=600&q=85"],
  ["Mel", "Gato", "Gato SRD", "Fêmea", "2 anos", "Pequeno", "4,5 kg", "São Paulo", "Disponível para adoção", "Mel é tranquila e gosta de ficar perto das pessoas.", "https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=600&q=85"],
  ["Rex", "Cachorro", "Pastor Alemão", "Macho", "4 anos", "Grande", "35 kg", "São Paulo", "Comigo", "Rex é ativo, atento e gosta de brincar.", "https://images.unsplash.com/photo-1551717743-49959800b1f6?w=600"],
  ["Nina", "Cachorro", "SRD", "Fêmea", "3 anos", "Médio", "15 kg", "São Paulo", "Adotado", "Nina é carinhosa e muito brincalhona.", "https://images.unsplash.com/photo-1507146426996-ef05306b995a?w=600"],
];

const CASOS = [
  ["Léo", "Cachorro", "Golden Retriever", "Macho", "Médio", "4 anos", "São Paulo", "Vila Mariana", "2026-10-15", "Registro de demonstração: visto pela última vez próximo ao parque usando coleira azul.", "(11) 99999-0001 (Demo)", "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=600&q=85"],
  ["Frajola", "Gato", "Gato SRD", "Macho", "Pequeno", "5 anos", "Campinas", "Cambuí", "2026-10-18", "Registro de demonstração: gato preto e branco muito dócil.", "(19) 99999-0002 (Demo)", "https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=600&q=85"],
  ["Pipoca", "Gato", "Gato SRD", "Fêmea", "Pequeno", "2 anos", "Santos", "Gonzaga", "2026-10-20", "Registro de demonstração: gatinha clara com mancha caramelo.", "(13) 99999-0003 (Demo)", "https://images.unsplash.com/photo-1511044568932-338cba0ad803?auto=format&fit=crop&w=600&q=85"],
];

const ONGS = [
  {
    nome: "[DEMO] Rede Proteção Animal Paulistana",
    descricao: "Organização demonstrativa voltada ao resgate, castração e adoção responsável na Grande São Paulo.",
    email: "contato.sp@demo.portalpet.local",
    telefone: "(11) 3000-0001 (Demo)",
    cidade: "São Paulo",
    estado: "SP",
    endereco: "Av. Demonstrativa, 100 - Centro (Dados de Demonstração)",
    site: "https://demo.portalpet.local/ong-sp",
    regioes: [
      ["São Paulo", "Centro, Zona Sul, Zona Oeste, Zona Leste e Zona Norte"],
      ["Guarulhos", "Região Metropolitana de São Paulo"],
    ],
  },
  {
    nome: "[DEMO] Abrigo Amigos de Quatro Patas Interior",
    descricao: "Organização demonstrativa de acolhimento de cães e gatos na região de Campinas.",
    email: "contato.campinas@demo.portalpet.local",
    telefone: "(19) 3000-0002 (Demo)",
    cidade: "Campinas",
    estado: "SP",
    endereco: "Rua Exemplo Solidário, 250 (Dados de Demonstração)",
    site: "https://demo.portalpet.local/ong-campinas",
    regioes: [
      ["Campinas", "Região Metropolitana de Campinas e Interior Paulista"],
      ["Valinhos", "Interior Paulista"],
    ],
  },
  {
    nome: "[DEMO] Projeto Patas do Litoral",
    descricao: "Organização demonstrativa focada em proteção animal na Baixada Santista.",
    email: "contato.litoral@demo.portalpet.local",
    telefone: "(13) 3000-0003 (Demo)",
    cidade: "Santos",
    estado: "SP",
    endereco: "Av. Orla Demo, 45 (Dados de Demonstração)",
    site: "https://demo.portalpet.local/ong-santos",
    regioes: [
      ["Santos", "Baixada Santista e Litoral Sul"],
      ["São Vicente", "Baixada Santista"],
    ],
  },
];

async function obterUsuarioDemo() {
  const [existente] = await pool.query("SELECT id FROM usuarios WHERE email = ?", [EMAIL_DEMO]);
  if (existente.length) return existente[0].id;

  const senhaHash = await bcrypt.hash("123456", 10);
  const [resultado] = await pool.query(
    `INSERT INTO usuarios (nome, email, senha_hash, telefone, cep, rua, numero, complemento, bairro, cidade, estado, sobre)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      "Carlos Mendes (Tutor Demo)", EMAIL_DEMO, senhaHash, "(11) 99999-0000", "01001000",
      "Praça da Sé", "100", "Bloco A", "Sé", "São Paulo", "SP",
      "Tutor e voluntário de demonstração do sistema PortalPet.",
    ]
  );
  return resultado.insertId;
}

async function popular() {
  await inicializarBanco();
  const usuarioId = await obterUsuarioDemo();
  let novos = { animais: 0, casos: 0, ongs: 0 };

  for (const a of ANIMAIS) {
    const [existe] = await pool.query("SELECT id FROM animais WHERE usuario_id = ? AND nome = ?", [usuarioId, a[0]]);
    if (existe.length) continue;
    await pool.query(
      `INSERT INTO animais (usuario_id, nome, especie, raca, sexo, idade, porte, peso, cidade, status, descricao, imagem)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [usuarioId, ...a]
    );
    novos.animais++;
  }

  for (const c of CASOS) {
    const [existe] = await pool.query(
      "SELECT id FROM casos_desaparecidos WHERE usuario_id = ? AND nome = ? AND data_ocorrencia = ?",
      [usuarioId, c[0], c[8]]
    );
    if (existe.length) continue;
    await pool.query(
      `INSERT INTO casos_desaparecidos
         (usuario_id, tipo_ocorrencia, nome, especie, raca, sexo, porte, idade, cidade, bairro, data_ocorrencia, descricao, contato, foto)
       VALUES (?, 'Desaparecido', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [usuarioId, ...c]
    );
    novos.casos++;
  }

  for (const o of ONGS) {
    const [existe] = await pool.query("SELECT id FROM ongs WHERE nome = ?", [o.nome]);
    if (existe.length) continue;
    const [resultado] = await pool.query(
      `INSERT INTO ongs (nome, descricao, email, telefone, cidade, estado, endereco, site, eh_demonstracao)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [o.nome, o.descricao, o.email, o.telefone, o.cidade, o.estado, o.endereco, o.site]
    );
    for (const [cidade, regiao] of o.regioes) {
      await pool.query(
        "INSERT INTO ong_regioes (ong_id, cidade_atendida, regiao_atendida, estado) VALUES (?, ?, ?, ?)",
        [resultado.insertId, cidade, regiao, o.estado]
      );
    }
    novos.ongs++;
  }

  console.log(`Dados de demonstração inseridos: ${novos.animais} animais, ${novos.casos} ocorrências, ${novos.ongs} ONGs.`);
  console.log(`Login de teste: ${EMAIL_DEMO} / 123456`);
}

popular()
  .catch((erro) => {
    console.error("Falha ao inserir dados de demonstração:", erro.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
