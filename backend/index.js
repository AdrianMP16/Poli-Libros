// backend/index.js
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares globales
app.use(cors({
  origin: "http://localhost:5173", // Autoriza únicamente a tu frontend de Vite
  methods: ["GET", "POST", "PUT", "DELETE"], // Permite los métodos HTTP que usas
  allowedHeaders: ["Content-Type", "Authorization"], // ¡Clave! Permite que envíes el token de Firebase Auth
  credentials: true
}));
app.use(express.json());

// IMPORTACIÓN DE RUTAS
const rutasLibros = require("./routes/libros");
const rutasReportes = require("./routes/reportes");
const rutasUsuarios = require("./routes/usuarios");

// ENRUTAMIENTO PRINCIPAL
app.use("/api/libros", rutasLibros);
app.use("/api/reportes", rutasReportes);
app.use("/api/usuarios", rutasUsuarios);

// Inicio del servidor
app.listen(PORT, () => {
  console.log(`Servidor Express corriendo en http://localhost:${PORT}`);
});