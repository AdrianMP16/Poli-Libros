// backend/config/firebase.js
const admin = require("firebase-admin");

if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
  console.error("FALTAN LAS CREDENCIALES DE FIREBASE EN EL .ENV");
  process.exit(1); // Detiene la app si no hay credenciales
}

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Exportamos admin y db para usarlos en las rutas y middlewares
module.exports = { admin, db };