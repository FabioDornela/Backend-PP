const fs = require("fs");
const path = require("path");
const { env } = require("../config/env");

// Caminho público guardado no banco (ex.: /uploads/123-abc.jpg) a partir do arquivo enviado.
function caminhoPublico(arquivo) {
  return arquivo ? `/uploads/${arquivo.filename}` : undefined;
}

// Só apaga arquivos dentro da pasta de uploads, nunca caminhos arbitrários.
function removerImagem(caminho) {
  if (typeof caminho !== "string" || !caminho.startsWith("/uploads/")) return;
  const arquivo = path.resolve(env.uploadDir, path.basename(caminho));
  if (path.dirname(arquivo) === env.uploadDir) fs.unlink(arquivo, () => {});
}

module.exports = { caminhoPublico, removerImagem };
