// backend/config/firebase.js
const admin = require("firebase-admin");
const serviceAccount = require("../firebase-credentials.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Exportamos admin y db para usarlos en las rutas y middlewares
module.exports = { admin, db };