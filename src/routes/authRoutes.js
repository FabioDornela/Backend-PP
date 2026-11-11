import { Router } from "express";

import controller from "../controllers/authController.js";
import autenticarUsuario from "../middlewares/autenticarUsuario.js";
import validarDados from "../middlewares/validarDados.js";
import { limiteAutenticacao } from "../middlewares/limitarRequisicoes.js";

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

export default router;