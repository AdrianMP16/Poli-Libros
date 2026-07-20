const { admin } = require("../config/firebase");
const db = admin.firestore();


module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("Usuario conectado:", socket.id);

    // 1. Obtener la lista de chats para la bandeja
    socket.on("obtener-mis-chats", async (usuarioId) => {
      console.log("=> Intentando buscar chats para el usuario ID:", usuarioId);
      try {
        const chatsVendedor = await db.collection("chats").where("receptor", "==", usuarioId).get();
        const chatsComprador = await db.collection("chats").where("remitente", "==", usuarioId).get();

        const conversaciones = new Map();

        const procesarMensajes = (docs) => {
          docs.forEach(doc => {
            const data = doc.data();
            const partesSala = data.sala.split('_');
            const compradorId = partesSala[2];

            if (!conversaciones.has(data.sala)) {
              conversaciones.set(data.sala, {
                sala: data.sala,
                libroId: data.libroId,
                compradorId: compradorId,
                otroUsuarioId: data.remitente === usuarioId ? data.receptor : data.remitente,
                ultimoMensaje: data.texto,
                timestamp: data.timestamp ? data.timestamp.toDate().getTime() : 0
              });
            } else {
              const chatExistente = conversaciones.get(data.sala);
              const msgTime = data.timestamp ? data.timestamp.toDate().getTime() : 0;
              if (msgTime > chatExistente.timestamp) {
                chatExistente.ultimoMensaje = data.texto;
                chatExistente.timestamp = msgTime;
              }
            }
          });
        };

        procesarMensajes(chatsVendedor.docs);
        procesarMensajes(chatsComprador.docs);

        const listaChats = Array.from(conversaciones.values()).sort((a, b) => b.timestamp - a.timestamp);
        socket.emit("mis-chats-cargados", listaChats);
      } catch (error) {
        console.error("Error al obtener chats:", error);
      }
    });

    // 2. Unirse a una sala específica
    socket.on("unirse-sala", async ({ libroId, compradorId }) => {
      const sala = `chat_${libroId}_${compradorId}`;
      socket.join(sala);

      try {
        const snapshot = await db.collection("chats")
          .where("sala", "==", sala)
          .orderBy("timestamp", "asc")
          .get();

        const historial = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            ...data,
            timestamp: data.timestamp ? data.timestamp.toDate().toISOString() : new Date().toISOString()
          };
        });
        socket.emit("historial-cargado", historial);
      } catch (error) {
        console.error("Error al cargar historial:", error);
      }
    });

    // 3. Enviar mensaje
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
        await db.collection("chats").add(datosMensaje);
        io.to(sala).emit("nuevo-mensaje", datosMensaje);
      } catch (error) {
        console.error("Error al guardar mensaje:", error);
      }
    });
  });
};