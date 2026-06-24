const express = require("express");
const router = express.Router();
const { db } = require("../config/firebase");
const { verificarAdmin } = require("../middlewares/authMiddleware");

// RUTA PÚBLICA para el Landing.jsx
router.get("/", async (req, res) => {
  try {
    const snapshot = await db.collection("anuncios").orderBy("fecha", "desc").get();
    const anuncios = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(anuncios);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener anuncios", error: error.message });
  }
});

// RUTA PROTEGIDA: Crear un anuncio 
router.post("/", verificarAdmin, async (req, res) => {
  try {
    const { titulo, mensaje, autor } = req.body;

    if (!titulo || !mensaje) {
      return res.status(400).json({ mensaje: "Título y mensaje son obligatorios" });
    }

    const nuevoAnuncio = {
      titulo,
      mensaje,
      autor: autor || "Administración",
      fecha: new Date().toISOString() // Usamos formato ISO para evitar problemas con timestamps en el front
    };

    const docRef = await db.collection("anuncios").add(nuevoAnuncio);
    res.status(201).json({ mensaje: "Anuncio publicado exitosamente", id: docRef.id });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al crear anuncio", error: error.message });
  }
});

//Eliminar un anuncio
router.delete("/:id", verificarAdmin, async (req, res) => {
  try {
    const idAnuncio = req.params.id;
    const docRef = db.collection("anuncios").doc(idAnuncio);

    // Verificamos si el anuncio existe antes de borrarlo
    const doc = await docRef.get();
    if (!doc.exists) {
      return res.status(404).json({ mensaje: "El anuncio no existe o ya fue eliminado" });
    }

    // Procedemos a borrarlo de Firestore
    await docRef.delete();
    res.json({ mensaje: "Anuncio eliminado exitosamente" });

  } catch (error) {
    res.status(500).json({ mensaje: "Error al eliminar el anuncio", error: error.message });
  }
});

module.exports = router;