import fs from "fs";
import ErroHttp from "../utils/erroHttp.js";

function rotaNaoEncontrada(req, res, next) {
  next(new ErroHttp(404, "Rota não encontrada."));
}

function tratarErros(erro, req, res, next) {
  // Se a requisição falhou depois do upload, remove o arquivo que ficou órfão.
  if (req.file?.path) {
    fs.unlink(req.file.path, () => {});
  }

  if (erro instanceof ErroHttp) {
    const corpo = { erro: erro.message };

    if (erro.detalhes) {
      corpo.detalhes = erro.detalhes;
    }

    return res.status(erro.status).json(corpo);
  }

  if (erro.type === "entity.parse.failed") {
    return res.status(400).json({ erro: "JSON inválido." });
  }

  if (erro.type === "entity.too.large") {
    return res.status(413).json({ erro: "Requisição grande demais." });
  }

  if (erro.status === 404) {
    return res.status(404).json({ erro: "Recurso não encontrado." });
  }

  if (erro.code === "ER_DUP_ENTRY") {
    return res.status(409).json({ erro: "Registro já existe." });
  }

  console.error(erro);

  res.status(500).json({ erro: "Erro interno do servidor." });
}

export { rotaNaoEncontrada, tratarErros };