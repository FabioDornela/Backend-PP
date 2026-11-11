import { Router } from "express";

import controller from "../controllers/animalController.js";

import autenticarUsuario, {
  autenticarOpcional,
} from "../middlewares/autenticarUsuario.js";

import validarDados, {
  validarId,
} from "../middlewares/validarDados.js";

import { uploadFoto } from "../middlewares/uploadImagem.js";
import { limiteEscrita } from "../middlewares/limitarRequisicoes.js";

const router = Router();

const STATUS_ANIMAL = [
  "Comigo",
  "Disponível para adoção",
  "Desaparecido",
  "Adotado",
];

const regrasAnimal = validarDados({
  nome: { obrigatorio: true, max: 80 },
  especie: { max: 30 },
  raca: { max: 80 },
  sexo: { enum: ["Macho", "Fêmea"] },
  idade: { max: 30 },
  porte: { enum: ["Pequeno", "Médio", "Grande"] },
  peso: { max: 20 },
  cidade: { max: 100 },
  bairro: { max: 100 },
  cep: { cep: true },
  status: { enum: STATUS_ANIMAL },
  descricao: { max: 2000 },
  remover_foto: { enum: ["true", "false"] },
});

router.param("id", validarId);

// Listagem pública de animais disponíveis para adoção
router.get("/", autenticarOpcional, controller.listar);

// Importante: "/meus" vem antes de "/:id"
router.get("/meus", autenticarUsuario, controller.listarMeus);

router.get("/:id", autenticarOpcional, controller.obter);

router.post(
  "/",
  autenticarUsuario,
  limiteEscrita,
  uploadFoto,
  regrasAnimal,
  controller.criar
);

router.put(
  "/:id",
  autenticarUsuario,
  limiteEscrita,
  uploadFoto,
  regrasAnimal,
  controller.atualizar
);

router.delete(
  "/:id",
  autenticarUsuario,
  limiteEscrita,
  controller.excluir
);

router.patch(
  "/:id/status",
  autenticarUsuario,
  limiteEscrita,
  validarDados({
    status: {
      obrigatorio: true,
      enum: STATUS_ANIMAL,
    },
  }),
  controller.atualizarStatus
);

export default router;