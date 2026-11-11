const { Router } = require("express");
const controller = require("../controllers/authController");
const autenticarUsuario = require("../middlewares/autenticarUsuario");
const validarDados = require("../middlewares/validarDados");
const { limiteAutenticacao } = require("../middlewares/limitarRequisicoes");

const router = Router();

router.post(
  "/cadastro",
  limiteAutenticacao,
  validarDados({
    nome: { obrigatorio: true, min: 2, max: 120 },
    email: { obrigatorio: true, email: true, max: 150 },
    senha: { obrigatorio: true, semTrim: true, min: 8, max: 72 },
    telefone: { max: 25 },
  }),
  controller.cadastro
);

router.post(
  "/login",
  limiteAutenticacao,
  validarDados({
    email: { obrigatorio: true, email: true, max: 150 },
    senha: { obrigatorio: true, semTrim: true, max: 72 },
  }),
  controller.login
);

router.get("/me", autenticarUsuario, controller.me);

module.exports = router;
