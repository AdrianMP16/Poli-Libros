const admin = require("firebase-admin");
const serviceAccount = require("./firestore_key_poli-libros.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

module.exports = db;