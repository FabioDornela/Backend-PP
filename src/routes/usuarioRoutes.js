import { Router } from "express";
import controller from "../controllers/usuarioController.js";
import autenticarUsuario from "../middlewares/autenticarUsuario.js";
import validarDados from "../middlewares/validarDados.js";
import { limiteEscrita } from "../middlewares/limitarRequisicoes.js";

const router = Router();

router.use(autenticarUsuario);

router.get("/perfil", controller.obterPerfil);

router.put(
  "/perfil",
  limiteEscrita,
  validarDados({
    nome: { obrigatorio: true, min: 2, max: 120 },
    email: { obrigatorio: true, email: true, max: 150 },
    telefone: { max: 25 },
    cep: { cep: true },
    rua: { max: 150 },
    numero: { max: 20 },
    complemento: { max: 80 },
    bairro: { max: 100 },
    cidade: { max: 100 },
    estado: { uf: true },
    sobre: { max: 1000 },
  }),
  controller.atualizarPerfil
);

export default router;