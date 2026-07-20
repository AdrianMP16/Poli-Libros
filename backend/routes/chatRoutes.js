const express = require("express");
const router = express.Router();
const { admin } = require("../config/firebase");
const { verificarAutenticado } = require("../middlewares/authMiddleware");

router.post("/iniciar", verificarAutenticado, async (req, res) => {
  try {
    const { libroId, vendedorId } = req.body;
    const compradorId = req.user.uid; 
    const sala = `chat_${libroId}_${compradorId}`;
    const db = admin.firestore();

    const chatExistente = await db.collection("chats")
      .where("sala", "==", sala)
      .limit(1)
      .get();

    if (!chatExistente.empty) {
      return res.status(200).json({ mensaje: "El chat ya existe, redirigiendo." });
    }

    const primerMensaje = {
      texto: "Hola, me interesa este libro.",
      remitente: compradorId,
      receptor: vendedorId,
      libroId: libroId,
      sala: sala,
      hora: new Date().toLocaleTimeString('es-EC'),
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      leido: false
    };

    await db.collection("chats").add(primerMensaje);
    res.status(200).json({ mensaje: "Chat iniciado correctamente." });
  } catch (error) {
    console.error("Error al crear la sala de chat:", error);
    res.status(500).json({ error: "Error interno del servidor al iniciar chat." });
  }
});

module.exports = router;