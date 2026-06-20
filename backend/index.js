// backend/index.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares globales
app.use(cors({
  origin: "http://localhost:5173", 
  methods: ["GET", "POST", "PUT", "DELETE"], // Permite los métodos HTTP
  allowedHeaders: ["Content-Type", "Authorization"], 
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

// RUTA ADICIONAL PARA SABER QUE ESTÁ ACTIVO EN VEZ DE LANZAR "CANNOT GET"
app.get("/", (req, res) => {
  res.send("El backend de PoliLibros está activo y escuchando peticiones.");
});

// Inicio del servidor
app.listen(PORT, () => {
  console.log(`Servidor Express corriendo en http://localhost:${PORT}`);
});