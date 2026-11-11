import { Router } from "express";
import controller from "../controllers/ongController.js";
import { validarId } from "../middlewares/validarDados.js";

const router = Router();

router.param("id", validarId);

router.get("/", controller.listar);

// Importante: "/recomendadas" vem antes de "/:id"
router.get("/recomendadas", controller.recomendadas);

router.get("/:id", controller.obter);

export default router;