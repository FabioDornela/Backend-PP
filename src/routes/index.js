const { Router } = require("express");
const pool = require("../config/database");

const router = Router();

router.get("/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", banco: "conectado" });
  } catch (erro) {
    // Sem detalhes internos da conexão na resposta.
    res.status(503).json({ status: "erro", banco: "indisponível" });
  }
});

router.use("/auth", require("./authRoutes"));
router.use("/usuarios", require("./usuarioRoutes"));
router.use("/animais", require("./animalRoutes"));
router.use("/adocao", require("./adocaoRoutes"));
router.use("/desaparecidos", require("./desaparecidosRoutes"));
router.use("/ongs", require("./ongRoutes"));

module.exports = router;
