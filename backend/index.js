// backend/index.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares globales
app.use(cors({
  origin: ["http://localhost:5173", "https://poli-libros-wine.vercel.app"], // Permite solicitudes desde tu frontend
  methods: ["GET", "POST", "PUT", "DELETE"], // Permite los métodos HTTP
  allowedHeaders: ["Content-Type", "Authorization"], 
  credentials: true
}));


// IMPORTACIÓN DE RUTAS
const rutasLibros = require("./routes/libros");
const rutasReportes = require("./routes/reportes");
const rutasUsuarios = require("./routes/usuarios");
const rutasAnuncios = require("./routes/anuncios");
const rutasPagos = require("./routes/pagos");

app.post(
  "/api/pagos/webhook", 
  express.raw({ type: "application/json" }), 
  rutasPagos.manejarWebhook
);

app.use(express.json());

// ENRUTAMIENTO PRINCIPAL
app.use("/api/libros", rutasLibros);
app.use("/api/reportes", rutasReportes);
app.use("/api/usuarios", rutasUsuarios);
app.use("/api/anuncios", rutasAnuncios);
app.use("/api/pagos", rutasPagos.router);

// RUTA ADICIONAL PARA SABER QUE ESTÁ ACTIVO EN VEZ DE LANZAR "CANNOT GET"
app.get("/", (req, res) => {
  res.send("El backend de PoliLibros está activo y escuchando peticiones.");
});

console.log("Backend iniciado");
console.log("Ruta Stripe: POST /api/pagos/create-checkout-session");
console.log("Ruta Webhook: POST /api/pagos/webhook");
// Inicio del servidor
app.listen(PORT, () => {
  console.log(`Servidor Express corriendo en http://localhost:${PORT}`);
});