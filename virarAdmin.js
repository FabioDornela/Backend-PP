import bcrypt from "bcryptjs";
import db from "./src/config/database.js";

const ADMIN_NOME = "Admin";
const ADMIN_EMAIL = "admin@portalpet.com";
const ADMIN_SENHA = "SuaSenhaForte123";

async function configurarAdmin() {
  try {
    console.log("1. Verificando coluna 'role'...");
    try {
      await db.query(
        "ALTER TABLE usuarios ADD COLUMN role ENUM('usuario', 'admin') NOT NULL DEFAULT 'usuario'"
      );
      console.log("-> Coluna 'role' criada!");
    } catch (erro) {
      if (erro.code !== "ER_DUP_FIELDNAME") throw erro;
    }

    const [existentes] = await db.query(
      "SELECT id FROM usuarios WHERE email = ?",
      [ADMIN_EMAIL]
    );

    if (existentes.length > 0) {
      await db.query("UPDATE usuarios SET role = 'admin' WHERE email = ?", [
        ADMIN_EMAIL,
      ]);
      console.log(`-> Conta existente (${ADMIN_EMAIL}) promovida para ADMIN!`);
    } else {
      const senhaHash = await bcrypt.hash(ADMIN_SENHA, 10);
      await db.query(
        "INSERT INTO usuarios (nome, email, senha_hash, telefone, role) VALUES (?, ?, ?, ?, 'admin')",
        [ADMIN_NOME, ADMIN_EMAIL, senhaHash, "11999999999"]
      );
      console.log("-> Conta ADMIN criada do zero com sucesso!");
      console.log(`   Login: ${ADMIN_EMAIL}`);
      console.log(`   Senha: ${ADMIN_SENHA}`);
    }

    const [usuarios] = await db.query("SELECT id, nome, email, role FROM usuarios");
    console.log("\nUsuários neste banco:");
    console.table(usuarios);

    const [animais] = await db.query("SELECT id, nome, especie, status, usuario_id FROM animais");
    console.log("\nAnimais cadastrados neste banco:");
    console.table(animais);

    process.exit(0);
  } catch (erro) {
    console.error("Erro:", erro);
    process.exit(1);
  }
}

configurarAdmin();