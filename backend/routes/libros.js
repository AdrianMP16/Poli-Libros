// backend/routes/libros.js
const express = require("express");
const router = express.Router();
const { db } = require("../config/firebase");
const { verificarAdmin, verificarAutenticado } = require("../middlewares/authMiddleware");

const multer = require("multer");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = multer.memoryStorage();
const upload = multer({ storage });

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

// 🟡 RUTA PROTEGIDA: Publicar un libro CON IMAGEN
router.post("/", verificarAutenticado, upload.single('imagen'), async (req, res) => {
  try {
    let imagen_url = null;

    // 1. Si viene una imagen, la subimos a Cloudinary
    if (req.file) {
      const b64 = Buffer.from(req.file.buffer).toString("base64");
      const dataURI = "data:" + req.file.mimetype + ";base64," + b64;
      
      const cldRes = await cloudinary.uploader.upload(dataURI, {
        folder: "polilibros"
      });
      imagen_url = cldRes.secure_url;
    }

    // 2. Preparamos el objeto del libro con tu nueva estructura
    // FormData envía todo como "String", así que convertimos los booleanos y números
    const nuevoLibro = {
      // Como me dijiste que el nivel es el título, lo guardamos en ambos para que
      // no se rompan tus tarjetas de React que buscan "libro.titulo"
      nivel: req.body.nivel,
      
      descripcion: req.body.descripcion || "",
      precio: Number(req.body.precio),
      
      // Convertimos los strings "true"/"false" a verdaderos booleanos
      incluye_codigo: req.body.incluye_codigo === "true",
      estado_fisico: req.body.estado_fisico === "true",
      
      // NUEVO: El estado por defecto que manejará tu historial de ventas
      disponibilidad: true, 
      
      imagen_url: imagen_url || "", 
      vendedor_id: req.user.uid,
      fecha_publicacion: new Date().toISOString()
    };
    
    // 3. Guardamos en Firestore
    const docRef = await db.collection("libros").add(nuevoLibro);
    res.status(201).json({ mensaje: "Libro publicado", id: docRef.id });
  } catch (error) {
    console.error("🔥 Error crítico al publicar:", error); 
    res.status(500).json({ mensaje: "Error al publicar", error: error.message });
  }
});

// ELIMINAR UN LIBRO (Lógica que ya tenías)
router.delete("/:id", verificarAutenticado, async (req, res) => {
  try {
    const docRef = db.collection("libros").doc(req.params.id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ mensaje: "Libro no encontrado" });
    }

    const libro = doc.data();

    if (libro.vendedor_id !== req.user.uid && req.user.role !== "admin") {
      return res.status(403).json({ mensaje: "No tienes permiso para borrar este libro" });
    }

    await docRef.delete();
    res.json({ mensaje: "Libro eliminado" });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al eliminar libro", error: error.message });
  }
});

module.exports = router;