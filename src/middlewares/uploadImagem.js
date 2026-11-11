const fs = require("fs");
const crypto = require("crypto");
const multer = require("multer");
const { env } = require("../config/env");
const ErroHttp = require("../utils/erroHttp");

const EXTENSOES = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

fs.mkdirSync(env.uploadDir, { recursive: true });

const armazenamento = multer.diskStorage({
  destination: (req, file, cb) => cb(null, env.uploadDir),
  // O nome é gerado pelo servidor: o nome enviado pelo cliente nunca é usado.
  filename: (req, file, cb) => {
    const nome = `${Date.now()}-${crypto.randomBytes(8).toString("hex")}`;
    cb(null, nome + EXTENSOES[file.mimetype]);
  },
});

const upload = multer({
  storage: armazenamento,
  limits: { fileSize: env.uploadMaxMb * 1024 * 1024, files: 1 },
  fileFilter: (req, file, cb) => {
    if (!EXTENSOES[file.mimetype]) {
      return cb(new ErroHttp(400, "Envie uma imagem JPG, PNG, WEBP ou GIF."));
    }
    cb(null, true);
  },
});

// Confere os primeiros bytes: o mimetype enviado pelo cliente pode ser falsificado.
function assinaturaValida(caminho) {
  const buffer = Buffer.alloc(12);
  const fd = fs.openSync(caminho, "r");
  try {
    fs.readSync(fd, buffer, 0, 12, 0);
  } finally {
    fs.closeSync(fd);
  }

  const inicio = buffer.toString("latin1");
  return (
    (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) ||
    buffer.subarray(0, 4).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47])) ||
    inicio.startsWith("GIF87a") ||
    inicio.startsWith("GIF89a") ||
    (inicio.startsWith("RIFF") && inicio.slice(8, 12) === "WEBP")
  );
}

// Aceita multipart com o campo "foto" (opcional).
function uploadFoto(req, res, next) {
  upload.single("foto")(req, res, (erro) => {
    if (erro) {
      if (erro.code === "LIMIT_FILE_SIZE") {
        return next(new ErroHttp(413, `A imagem deve ter no máximo ${env.uploadMaxMb} MB.`));
      }
      if (erro instanceof multer.MulterError) {
        return next(new ErroHttp(400, "Envio de imagem inválido."));
      }
      return next(erro);
    }

    if (req.file && !assinaturaValida(req.file.path)) {
      fs.unlink(req.file.path, () => {});
      req.file = undefined;
      return next(new ErroHttp(400, "O arquivo enviado não é uma imagem válida."));
    }

    next();
  });
}

module.exports = { uploadFoto };
