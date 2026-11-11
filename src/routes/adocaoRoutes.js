const { Router } = require("express");
const controller = require("../controllers/adocaoController");
const autenticarUsuario = require("../middlewares/autenticarUsuario");
const validarDados = require("../middlewares/validarDados");
const { validarId } = require("../middlewares/validarDados");
const { limiteEscrita } = require("../middlewares/limitarRequisicoes");

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

router.get("/animais/:id/interesses", controller.interessesDoAnimal);

router.patch(
  "/interesses/:id/status",
  limiteEscrita,
  validarDados({
    status: { obrigatorio: true, enum: ["Pendente", "Aceito", "Recusado", "Cancelado"] },
  }),
  controller.atualizarStatus
);

module.exports = router;
