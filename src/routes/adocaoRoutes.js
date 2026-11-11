import { Router } from "express";

import controller from "../controllers/adocaoController.js";
import autenticarUsuario from "../middlewares/autenticarUsuario.js";
import validarDados, {
  validarId,
} from "../middlewares/validarDados.js";

import { limiteEscrita } from "../middlewares/limitarRequisicoes.js";

const router = Router();

router.param("id", validarId);

router.use(autenticarUsuario);

router.post(
  "/interesses",
  limiteEscrita,
  validarDados({
    animal_id: { obrigatorio: true, inteiro: true },
    mensagem: { max: 500 },
  }),
  controller.manifestarInteresse
);

router.get("/meus-interesses", controller.meusInteresses);

router.get(
  "/animais/:id/interesses",
  controller.interessesDoAnimal
);

router.patch(
  "/interesses/:id/status",
  limiteEscrita,
  validarDados({
    status: {
      obrigatorio: true,
      enum: ["Pendente", "Aceito", "Recusado", "Cancelado"],
    },
  }),
  controller.atualizarStatus
);

export default router;