// backend/routes/libros.js
const express = require("express");
const router = express.Router();
const { db } = require("../config/firebase");
const { verificarAdmin } = require("../middlewares/authMiddleware");

// OBTENER TODOS LOS LIBROS (Para tu ListaLibros.jsx)
router.get("/", async (req, res) => {
  try {
    const snapshot = await db.collection("libros").orderBy("fecha_publicacion", "desc").get();
    const libros = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(libros);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener libros", error: error.message });
  }
});

// ELIMINAR UN LIBRO (Lógica que ya tenías)
router.delete("/:id", verificarAdmin, async (req, res) => {
  try {
    const docRef = db.collection("libros").doc(req.params.id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ mensaje: "Libro no encontrado" });
    }

    await docRef.delete();
    res.json({ mensaje: "Libro eliminado" });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al eliminar libro", error: error.message });
  }
});

module.exports = router;