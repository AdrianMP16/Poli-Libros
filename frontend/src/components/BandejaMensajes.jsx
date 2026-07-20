import React, { useState, useEffect, useRef } from 'react';
import { auth } from '../services/authService';
import { io } from 'socket.io-client';
import { API_URL } from '../services/config';
import '../styles/BandejaMensajes.css';

export default function BandejaMensajes({ libros = [] }) {
  const [usuarioActual, setUsuarioActual] = useState(null);
  const [listaChats, setListaChats] = useState([]);
  const [chatActivo, setChatActivo] = useState(null);
  const [mensajes, setMensajes] = useState([]);
  const [nuevoMensaje, setNuevoMensaje] = useState("");

  const socketRef = useRef(null);
  const mensajesEndRef = useRef(null);

  // 1. Escuchar autenticación
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUsuarioActual(user);
    });
    return () => unsubscribe();
  }, []);

  // 2. Conectar a Socket y cargar la lista de chats
  useEffect(() => {
    if (usuarioActual) {
      socketRef.current = io(API_URL.replace('/api', ''));
      socketRef.current.on("connect", () => {
        console.log("¡Éxito! Conectado al servidor de chats.");
      });

      socketRef.current.on("connect_error", (err) => {
        console.error("Falló la conexión al servidor:", err);
      });

      socketRef.current.emit("obtener-mis-chats", usuarioActual.uid);

      socketRef.current.on("mis-chats-cargados", (chats) => {
        // Enriquecemos los chats buscando el libro en las props locales
        const chatsEnriquecidos = chats.map((chat) => {
          const libroEncontrado = libros.find(
            (l) => l.id === chat.libroId || l._id === chat.libroId || String(l.id) === String(chat.libroId)
          );

          if (libroEncontrado) {
            return {
              ...chat,
              tituloLibro: `${libroEncontrado.nivel} - $${libroEncontrado.precio}`
            };
          }

          return { ...chat, tituloLibro: `Libro Publicado (${chat.libroId.substring(0, 6)}...)` };
        });

        setListaChats(chatsEnriquecidos);
      });

      socketRef.current.on("nuevo-mensaje", (mensaje) => {
        setMensajes((prev) => [...prev, mensaje]);
      });

      socketRef.current.on("historial-cargado", (historial) => {
        setMensajes(historial);
        scrollToBottom();
      });

      return () => socketRef.current.disconnect();
    }
  }, [usuarioActual, libros]);

  const scrollToBottom = () => {
    mensajesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => scrollToBottom(), [mensajes]);

  const abrirChat = (chat) => {
    setChatActivo(chat);
    setMensajes([]);

    socketRef.current.emit("unirse-sala", {
      libroId: chat.libroId,
      compradorId: chat.compradorId
    });
  };

  const enviarMensajeChat = (e) => {
    e.preventDefault();
    if (nuevoMensaje.trim() === "" || !chatActivo) return;

    socketRef.current.emit("enviar-mensaje", {
      sala: chatActivo.sala,
      mensaje: nuevoMensaje,
      remitente: usuarioActual.uid,
      receptorId: chatActivo.otroUsuarioId,
      libroId: chatActivo.libroId,
    });

    setNuevoMensaje("");
  };

  if (!usuarioActual) return <div style={{ color: '#fff', padding: '20px' }}>Cargando bandeja...</div>;

  return (
    <div className="bandeja-container">
      {/* PANEL IZQUIERDO: Lista de Chats */}
      <div className="bandeja-sidebar">
        <h3>Mis Mensajes</h3>
        <div className="lista-chats">
          {listaChats.length === 0 ? (
            <p className="no-chats">No tienes conversaciones aún.</p>
          ) : (
            listaChats.map((chat, index) => (
              <div
                key={index}
                className={`chat-item ${chatActivo?.sala === chat.sala ? 'activo' : ''}`}
                onClick={() => abrirChat(chat)}
              >
                <div className="chat-item-info">
                  <strong>{chat.tituloLibro}</strong>
                  <p className="ultimo-mensaje">{chat.ultimoMensaje}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* PANEL DERECHO: Ventana de Conversación */}
      <div className="bandeja-main">
        {!chatActivo ? (
          <div className="selecciona-chat">
            <h2>Selecciona un chat para comenzar</h2>
          </div>
        ) : (
          <div className="chat-ventana">
            <div className="chat-header">
              <h4>Conversación sobre: {chatActivo.tituloLibro}</h4>
            </div>

            <div className="chat-mensajes-area">
              {mensajes.map((msg, index) => {
                const esMio = msg.remitente === usuarioActual.uid;
                return (
                  <div key={index} className={`chat-burbuja ${esMio ? 'propio' : 'externo'}`}>
                    <span>{msg.texto}</span>
                    <small>{msg.hora}</small>
                  </div>
                );
              })}
              <div ref={mensajesEndRef} />
            </div>

            <form onSubmit={enviarMensajeChat} className="chat-footer">
              <input
                type="text"
                value={nuevoMensaje}
                onChange={(e) => setNuevoMensaje(e.target.value)}
                placeholder="Escribe tu mensaje..."
                className="chat-input"
              />
              <button type="submit" className="chat-btn-enviar">➤</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}