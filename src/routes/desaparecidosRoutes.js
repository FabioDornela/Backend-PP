const { Router } = require("express");
const controller = require("../controllers/desaparecidosController");
const autenticarUsuario = require("../middlewares/autenticarUsuario");
const { autenticarOpcional } = require("../middlewares/autenticarUsuario");
const validarDados = require("../middlewares/validarDados");
const { validarId } = require("../middlewares/validarDados");
const { uploadFoto } = require("../middlewares/uploadImagem");
const { limiteEscrita } = require("../middlewares/limitarRequisicoes");

const router = Router();

const regrasCaso = validarDados({
  tipo_ocorrencia: { obrigatorio: true, enum: ["Desaparecido", "Encontrado"] },
  nome: { obrigatorio: true, max: 80 },
  especie: { max: 30 },
  raca: { max: 80 },
  sexo: { enum: ["Macho", "Fêmea"] },
  porte: { enum: ["Pequeno", "Médio", "Grande"] },
  idade: { max: 30 },
  descricao: { max: 2000 },
  cidade: { obrigatorio: true, max: 100 },
  bairro: { max: 100 },
  cep: { cep: true },
  contato: { obrigatorio: true, max: 120 },
  data_ocorrencia: { obrigatorio: true, data: true },
  animal_id: { inteiro: true },
  remover_foto: { enum: ["true", "false"] },
});

router.param("id", validarId);

router.get("/", autenticarOpcional, controller.listar);

// Importante: "/meus" vem antes de "/:id"
router.get("/meus", autenticarUsuario, controller.listarMeus);

router.get("/:id", autenticarOpcional, controller.obter);

router.post("/", autenticarUsuario, limiteEscrita, uploadFoto, regrasCaso, controller.criar);

router.put("/:id", autenticarUsuario, limiteEscrita, uploadFoto, regrasCaso, controller.atualizar);

router.patch("/:id/encerrar", autenticarUsuario, limiteEscrita, controller.encerrar);

module.exports = router;
