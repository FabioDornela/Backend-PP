const { Router } = require("express");
const controller = require("../controllers/ongController");
const { validarId } = require("../middlewares/validarDados");

const router = Router();

router.param("id", validarId);

router.get("/", controller.listar);

// Importante: "/recomendadas" vem antes de "/:id"
router.get("/recomendadas", controller.recomendadas);

router.get("/:id", controller.obter);

module.exports = router;
