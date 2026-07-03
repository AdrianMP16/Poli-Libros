const { admin } = require("../config/firebase");
const db = admin.firestore();

// Exportamos una función que recibe la instancia de 'io' desde el index.js
module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("Usuario conectado al chat:", socket.id);

    // Unirse a la sala específica del libro
    // Unirse a la sala específica del libro y cargar el historial
    socket.on("unirse-sala", async ({ libroId, compradorId }) => {
      const sala = `chat_${libroId}_${compradorId}`;
      socket.join(sala);
      console.log(`Usuario ${socket.id} se unió a la sala: ${sala}`);

      try {
        // Consultar a Firestore los mensajes de esta sala específica
        const snapshot = await db.collection("chats")
          .where("sala", "==", sala)
          .orderBy("timestamp", "asc") // Ordenamos del más antiguo al más reciente
          .get();

        const historial = snapshot.docs.map(doc => doc.data());
        
        // Emitimos el historial SOLO al usuario que se acaba de conectar
        socket.emit("historial-cargado", historial);

      } catch (error) {
        console.error("Error al cargar el historial desde Firestore:", error);
      }
    });

    // Recibir mensaje, guardar en Firestore y emitir a la sala
    socket.on("enviar-mensaje", async (data) => {
      const { sala, mensaje, remitente, receptorId, libroId } = data;

      const datosMensaje = {
        texto: mensaje,
        remitente: remitente,
        receptor: receptorId,
        libroId: libroId,
        sala: sala,
        hora: new Date().toLocaleTimeString(),
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        leido: false 
      };

      try {
        // Guardamos en Firebase
        await db.collection("chats").add(datosMensaje);

        // Emitimos a los usuarios de la sala
        io.to(sala).emit("nuevo-mensaje", datosMensaje);

      } catch (error) {
        console.error("Error al guardar el mensaje en Firestore:", error);
      }
    });

    socket.on("disconnect", () => {
      console.log("Usuario desconectado del chat:", socket.id);
    });
  });
};