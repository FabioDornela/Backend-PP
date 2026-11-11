import { Router } from "express";
import pool from "../config/database.js";

import authRoutes from "./authRoutes.js";
import usuarioRoutes from "./usuarioRoutes.js";
import animalRoutes from "./animalRoutes.js";
import adocaoRoutes from "./adocaoRoutes.js";
import desaparecidosRoutes from "./desaparecidosRoutes.js";
import ongRoutes from "./ongRoutes.js";

const router = Router();

router.get("/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");

    res.json({
      status: "ok",
      banco: "conectado",
    });
  } catch (erro) {
    // Sem detalhes internos da conexão na resposta.
    res.status(503).json({
      status: "erro",
      banco: "indisponível",
    });
  }
});

router.use("/auth", authRoutes);
router.use("/usuarios", usuarioRoutes);
router.use("/animais", animalRoutes);
router.use("/adocao", adocaoRoutes);
router.use("/desaparecidos", desaparecidosRoutes);
router.use("/ongs", ongRoutes);

export default router;