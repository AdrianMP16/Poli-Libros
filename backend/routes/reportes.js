// backend/routes/reportes.js
const express = require("express");
const router = express.Router();
const { db } = require("../config/firebase");
const { verificarAutenticado, verificarAdmin } = require("../middlewares/authMiddleware");

// CREAR REPORTE (Desde el cliente en LibroCard.jsx)
router.post("/", verificarAutenticado, async (req, res) => {
  try {
    const { reportedBy, reportedUser, bookId, bookTitle, reason } = req.body;

    if (!reportedBy || !bookId || !reason) {
      return res.status(400).json({ mensaje: "Datos del reporte incompletos" });
    }

    const nuevoReporte = {
      reportedBy,
      reportedUser,
      bookId,
      bookTitle,
      reason: reason.trim(),
      createdAt: new Date().toISOString(),
      status: "pending"
    };

    const docRef = await db.collection("reports").add(nuevoReporte);
    res.json({ mensaje: "Reporte creado exitosamente", id: docRef.id });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al procesar reporte", error: error.message });
  }
});

router.get("/mis-reportes", verificarAutenticado, async (req, res) => {
  try {
    // Buscamos los reportes donde el 'reportedUser' sea igual al UID del usuario que hace la petición
    const snapshot = await db.collection("reports")
                             .where("reportedUser", "==", req.user.uid)
                             .get();
                             
    const misReportes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(misReportes);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener tus reportes", error: error.message });
  }
});

// VER REPORTES PENDIENTES (Para AdminDashboard.jsx)
router.get("/pendientes", verificarAdmin, async (req, res) => {
  try {
    const snapshot = await db.collection("reports").where("status", "==", "pending").get();
    const reportes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(reportes);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener reportes", error: error.message });
  }
});

module.exports = router;