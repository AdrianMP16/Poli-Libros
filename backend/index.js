const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");

// 1. Importa el archivo de credenciales que descargaste
const serviceAccount = require("./firebase-credentials.json");

// 2. Inicializa el SDK usando esa cuenta de servicio
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const app = express();

app.use(cors());
app.use(express.json());

// Middleware 1: Solo verifica que el usuario esté autenticado (Usuario Común o Admin)
const verificarAutenticado = async (req, res, next) => {
  const tokenHeader = req.headers.authorization;
  if (!tokenHeader || !tokenHeader.startsWith("Bearer ")) {
    return res.status(401).json({ mensaje: "Acceso denegado. Regístrate o inicia sesión." });
  }

  const token = tokenHeader.split(" ")[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken; // Contiene el uid, email y sus claims personalizados
    next();
  } catch (error) {
    return res.status(403).json({ mensaje: "Token inválido o expirado." });
  }
};

// Middleware 2: Verifica estrictamente que el usuario sea ADMINISTRADOR
const verificarAdmin = async (req, res, next) => {
  // Primero corremos la verificación del token usando el proceso anterior
  const tokenHeader = req.headers.authorization;
  if (!tokenHeader || !tokenHeader.startsWith("Bearer ")) {
    return res.status(401).json({ mensaje: "No autorizado." });
  }

  const token = tokenHeader.split(" ")[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // VALIDACIÓN CRUCIAL: Comprobamos si tiene el atributo 'admin' en true
    if (decodedToken.role === "admin") {
      req.user = decodedToken;
      next(); // Es admin, lo dejamos pasar
    } else {
      return res.status(403).json({ mensaje: "Acceso denegado. Se requieren permisos de administrador." });
    }
  } catch (error) {
    return res.status(403).json({ mensaje: "Token inválido." });
  }
};



app.get("/", (req, res) => {
  res.send("API funcionando con Firebase");
});

// --- OBTENER TODOS LOS LIBROS ---
app.get("/api/libros", async (req, res) => {
  try {
    // En Firestore traemos la colección y ordenamos por un campo
    const snapshot = await db.collection("libros").orderBy("id", "asc").get();
    
    // Mapeamos los documentos para incluir su ID de Firestore si lo necesitas
    const libros = snapshot.docs.map(doc => ({
      id_firestore: doc.id,
      ...doc.data()
    }));

    res.json(libros);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al listar libros", error: error.message });
  }
});

// --- OBTENER UN LIBRO POR ID ---
// Nota: Aquí asumimos que usas el ID autogenerado de Firestore como identificador
app.get("/api/libros/:id", async (req, res) => {
  try {
    const docRef = db.collection("libros").doc(req.params.id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ mensaje: "Libro no encontrado" });
    }

    res.json({ id_firestore: doc.id, ...doc.data() });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener libro", error: error.message });
  }
});

// --- CREAR UN LIBRO ---
// Añadimos 'verificarAutenticado' antes del handler de la ruta
app.post("/api/libros", verificarAutenticado, async (req, res) => {
  try {
    const { titulo, descripcion, estado_fisico, incluye_codigo, nivel, precio, fotos } = req.body;

    // (Tus validaciones de campos obligatorios se quedan exactamente igual...)
    if (!titulo || !descripcion || !estado_fisico || incluye_codigo === undefined || !nivel || precio === undefined) {
      return res.status(400).json({ mensaje: "Faltan datos obligatorios." });
    }

    // ¡AHORA SÍ! El uid viene directamente y seguro desde el token verificado
    const vendedor_id = req.user.uid; 

    const nuevoLibro = {
      titulo: String(titulo).trim(),
      descripcion: String(descripcion).trim(),
      estado_fisico: String(estado_fisico).trim(),
      incluye_codigo: Boolean(incluye_codigo),
      nivel: String(nivel).trim(),
      precio: Number(precio),
      disponibilidad: true,
      fecha_publicacion: admin.firestore.FieldValue.serverTimestamp(),
      vendedor_id: vendedor_id, // Ligado automáticamente al usuario real
      fotos: Array.isArray(fotos) ? fotos : []
    };

    const docRef = await db.collection("libros").add(nuevoLibro);
    const nuevoDoc = await docRef.get();

    res.status(201).json({ id_firestore: docRef.id, ...nuevoDoc.data() });

  } catch (error) {
    res.status(500).json({ mensaje: "Error al crear el libro", error: error.message });
  }
});

// --- ACTUALIZAR UN LIBRO ---
app.put("/api/libros/:id", async (req, res) => {
  try {
    const docRef = db.collection("libros").doc(req.params.id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ mensaje: "Libro no encontrado" });
    }

    // .update() solo modifica los campos que le envíes en el body
    await docRef.update(req.body);
    
    const docActualizado = await docRef.get();
    res.json({ id_firestore: docRef.id, ...docActualizado.data() });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al actualizar libro", error: error.message });
  }
});

// --- ELIMINAR UN LIBRO ---
app.delete("/api/libros/:id", async (req, res) => {
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

app.delete("/api/usuarios/:uid", verificarAdmin, async (req, res) => {
  try {
    await admin.auth().deleteUser(req.params.uid);
    res.json({ mensaje: "Usuario eliminado de Firebase correctamente." });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al eliminar usuario.", error: error.message });
  }
});

// RUTA TEMPORAL PARA ASIGNARTE EL ROL DE ADMIN
// (La puedes borrar o comentar después de usarla)
app.post("/api/crear-primer-admin", async (req, res) => {
  const { uid } = req.body;

  if (!uid) {
    return res.status(400).json({ mensaje: "Falta el UID del usuario" });
  }

  try {
    // Inyectamos el atributo personalizado de manera definitiva en Firebase Auth
    await admin.auth().setCustomUserClaims(uid, { role: "admin" });
    res.json({ mensaje: `¡Éxito! El usuario con UID ${uid} ahora es oficialmente Administrador.` });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al asignar el rol", error: error.message });
  }
});

app.listen(3000, () => {
  console.log("Servidor corriendo en http://localhost:3000");
});