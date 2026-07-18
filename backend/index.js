// backend/index.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

// IMPORTACIÓN DE RUTAS
const rutasLibros = require("./routes/libros");
const rutasReportes = require("./routes/reportes");
const rutasUsuarios = require("./routes/usuarios");
const rutasAnuncios = require("./routes/anuncios");
const rutasPagos = require("./routes/pagos");
const chatSockets = require("./routes/chat");
const chatIA = require("./routes/chatIA");

const app = express();
const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "https://poli-libros-wine.vercel.app"],
    methods: ["GET", "POST"]
  }
});

// Middlewares globales
app.use(cors({
  origin: ["http://localhost:5173", "https://poli-libros-wine.vercel.app"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));


app.post("/api/pagos/webhook", express.raw({ type: "application/json" }), rutasPagos.manejarWebhook);

app.use(express.json());

// Inicializar el chat con Socket.IO
chatSockets(io);

app.post("/api/prueba", (req, res) => {
    res.json({ mensaje: "El backend funciona correctamente" });
});

// ENRUTAMIENTO PRINCIPAL
app.use("/api/libros", rutasLibros);
app.use("/api/reportes", rutasReportes);
app.use("/api/usuarios", rutasUsuarios);
app.use("/api/anuncios", rutasAnuncios);
app.use("/api/pagos", rutasPagos.router);
app.use("/api/chatIA", chatIA);

app.get("/", (req, res) => {
  res.send("El backend de PoliLibros está activo y escuchando peticiones.");
});

server.listen(PORT, () => {
  console.log(`Servidor y WebSocket corriendo en http://localhost:${PORT}`);
});