// backend/routes/usuarios.js
const express = require("express");
const router = express.Router();
const { admin } = require("../config/firebase");
const { verificarAdmin } = require("../middlewares/authMiddleware");

// ELIMINAR USUARIO (Lógica que ya tenías)
router.delete("/:uid", verificarAdmin, async (req, res) => {
  try {
    await admin.auth().deleteUser(req.params.uid);
    res.json({ mensaje: "Usuario eliminado de Firebase correctamente." });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al eliminar usuario.", error: error.message });
  }
});

// ASIGNAR ROL DE ADMIN (Lógica que ya tenías)
router.post("/crear-primer-admin", async (req, res) => {
  const { uid } = req.body;
  if (!uid) {
    return res.status(400).json({ mensaje: "Falta el UID del usuario" });
  }

  try {
    await admin.auth().setCustomUserClaims(uid, { admin: true });
    res.json({ mensaje: `Éxito. El usuario con UID ${uid} ahora es ADMINISTRADOR.` });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al asignar rol de administrador.", error: error.message });
  }
});

module.exports = router;