import React, { useState, useEffect } from 'react';
import { auth } from '../services/authService'; // Mantenemos solo el servicio de Auth local
import { API_URL } from '../services/config'; // Importamos la URL base de tu backend
import { useNavigate } from 'react-router-dom'; // Para redireccionar después de eliminar
import { io } from 'socket.io-client';

const LibroCard = ({ libro }) => {
  const navigate = useNavigate();
  const [usuarioActual, setUsuarioActual] = useState(null);
  const [mostrarDetalles, setMostrarDetalles] = useState(false);
  const socketRef = useRef(null);
  const mensajesEndRef = useRef(null);

  const scrollToBottom = () => {
    mensajesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [mensajes]);

  // Lógica para inicializar el chat cuando se abre
  useEffect(() => {
    if (chatAbierto && usuarioActual) {
      // Conectar al backend 
      socketRef.current = io(API_URL.replace('/api', ''));

      // Solicitar unirse a la sala
      socketRef.current.emit("unirse-sala", {
        libroId: id, // Usamos la variable 'id' desestructurada directamente
        compradorId: usuarioActual.uid
      });

      // 1. NUEVO: Recibir todo el historial de la base de datos
      socketRef.current.on("historial-cargado", (historial) => {
        setMensajes(historial);
      });

      // 2. Recibir nuevos mensajes en tiempo real
      socketRef.current.on("nuevo-mensaje", (mensaje) => {
        setMensajes((prev) => [...prev, mensaje]);
      });

      return () => {
        socketRef.current.disconnect();
      };
    }
  }, [chatAbierto, usuarioActual, id]);

  const enviarMensajeChat = () => {
    if (nuevoMensaje.trim() === "") return;
    const sala = `chat_${libro.id}_${usuarioActual.uid}`;

    socketRef.current.emit("enviar-mensaje", {
      sala,
      mensaje: nuevoMensaje,
      remitente: usuarioActual.uid
    });
    setNuevoMensaje("");
  };




  // Desestructuramos, manejando id_firestore (del backend) o id tradicional
  const {
    id,
    vendedor_id,
    descripcion,
    precio,
    nivel,
    estado_fisico,
    incluye_codigo,
    imagen_url,
    fecha_publicacion,
    disponibilidad
  } = libro;

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUsuarioActual(user);
    });
    return () => unsubscribe();
  }, []);

  const handleReport = async (e) => {
    e.stopPropagation();

    if (!usuarioActual) {
      return alert("Debes iniciar sesión para poder reportar una publicación.");
    }

    if (vendedor_id === usuarioActual.uid) {
      return alert("No puedes reportar tu propio libro.");
    }

    const motivo = prompt("Escribe la razón del reporte (ej. Precio falso, Estafa, Contenido inapropiado):");
    if (!motivo || motivo.trim() === "") return;

    try {
      const token = await usuarioActual.getIdToken();

      const res = await fetch(`${API_URL}/api/reportes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          reportedBy: usuarioActual.uid,
          reportedUser: vendedor_id,
          bookId: id,
          bookTitle: nivel,
          reason: motivo.trim(),
          chatHistory: mensajes
        })
      });

      const data = await res.json();

      if (res.ok) {
        alert("✅ Reporte enviado exitosamente al servidor.");
      } else {
        alert(`❌ Error del servidor: ${data.mensaje || "No se pudo procesar"}`);
      }

    } catch (error) {
      console.error("Error al enviar el reporte:", error);
      alert("Hubo un problema de red al conectar con el servidor.");
    }
  };

  const handleEliminar = async (e) => {
    e.stopPropagation();
    if (!window.confirm("¿Estás seguro de que deseas eliminar tu publicación? Esta acción no se puede deshacer.")) return;

    try {
      const token = await usuarioActual.getIdToken();
      const res = await fetch(`${API_URL}/api/libros/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (res.ok) {
        alert("✅ Publicación eliminada.");
        if (onEliminar) onEliminar(id); // Actualiza el estado en ListaLibros
      } else {
        const data = await res.json();
        alert(`❌ Error: ${data.mensaje || "No se pudo eliminar"}`);
      }
    } catch (error) {
      console.error("Error al eliminar:", error);
      alert("Hubo un problema de red al intentar eliminar el libro.");
    }
  };

  const handleComprar = async () => {
    if (!usuarioActual) {
      return alert("Debes iniciar sesión para comprar este libro.");
    }

    try {
      // Usamos el nombre del usuario logueado en Firebase o un valor por defecto
      const studentName = usuarioActual.displayName || "Estudiante";

      // El carrito solo contiene el libro actual
      const cart = [{ id: id, quantity: 1 }];

      const res = await fetch(
        `${API_URL}/api/pagos/create-checkout-session`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${await usuarioActual.getIdToken()}`
          },
          body: JSON.stringify({ cart, studentName })
        }
      );

      const text = await res.text();

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(`El servidor respondió: ${text}`);
      }

      if (!res.ok) {
        throw new Error(data.error || "Error creando la sesión");
      }

      window.location.href = data.url;
    } catch (err) {
      console.error("Error al procesar el pago:", err);
      alert("Hubo un problema al iniciar el pago: " + err.message);
    }
  };

  const formatearFecha = (timestamp) => {
    if (!timestamp) return '';
    // Si el backend envía el objeto Timestamp estructurado o un string ISO
    const fecha = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp);
    return isNaN(fecha) ? '' : fecha.toLocaleDateString('es-EC', { year: 'numeric', month: 'short', day: 'numeric' });
  };



  return (
    <div style={{ position: 'relative', display: 'flex' }}>

      <div className="libro-card" style={{ opacity: disponibilidad ? 1 : 0.6, position: 'relative', width: '100%', zIndex: 1 }}>

        {!disponibilidad && (
          <div style={{ position: 'absolute', top: 10, right: 10, background: 'red', color: 'white', padding: '5px 10px', borderRadius: '5px', fontWeight: 'bold', zIndex: 10 }}>
            VENDIDO
          </div>
        )}

        <div className="libro-badge-nivel">{nivel}</div>

        <div className="libro-imagen-contenedor">
          <img
            src={imagen_url || "data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22300%22%20height%3D%22400%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22%23cccccc%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20font-family%3D%22sans-serif%22%20font-size%3D%2224%22%20fill%3D%22%23666666%22%20text-anchor%3D%22middle%22%20dy%3D%22.3em%22%3ESin%20Foto%3C%2Ftext%3E%3C%2Fsvg%3E"}
            alt={`Portada del nivel ${nivel}`}
            className="libro-imagen"
          />
        </div>

        <div className="libro-info">
          <div className="libro-header">
            <h3 className="libro-titulo">{nivel}</h3>
            <span className="libro-precio">
              ${typeof precio === 'number' ? precio.toFixed(2) : parseFloat(precio) ? parseFloat(precio).toFixed(2) : '0.00'}
            </span>
          </div>

          <div className="libro-detalles">
            <span
              className="badge-estado"
              style={{
                backgroundColor: estado_fisico ? '#27ae60' : '#f39c12',
                color: 'white',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '0.85rem'
              }}
            >
              {estado_fisico ? "Buen estado físico" : "Usado / Con detalles"}
            </span>

            {incluye_codigo ? (
              <span className="badge-codigo codigo-si">Código Digital ✔</span>
            ) : (
              <span className="badge-codigo codigo-no">Sin Código ✘</span>
            )}
          </div>

          <div className="libro-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px' }}>
            <small className="libro-fecha">Publicado: {formatearFecha(fecha_publicacion)}</small>

            <div style={{ display: 'flex', gap: '8px' }}>
              {usuarioActual && usuarioActual.uid === vendedor_id ? (
                <button
                  onClick={handleEliminar}
                  style={{
                    backgroundColor: '#dc3545', color: 'white', border: 'none',
                    padding: '6px 10px', borderRadius: '4px', cursor: 'pointer',
                    fontWeight: 'bold', fontSize: '0.85rem'
                  }}
                >
                  🗑️ Eliminar
                </button>
              ) : (
                <button
                  onClick={handleReport}
                  style={{
                    backgroundColor: '#f39c12', color: 'white', border: 'none',
                    padding: '6px 10px', borderRadius: '4px', cursor: 'pointer',
                    fontWeight: 'bold', fontSize: '0.85rem'
                  }}
                >
                  ⚠️ Reportar
                </button>
              )}

              {/* 👈 NUEVO: Botón que alterna la visibilidad del panel en vez de redirigir */}
              <button
                className="btn-ver-mas"
                onClick={() => setMostrarDetalles(!mostrarDetalles)}
              >
                {mostrarDetalles ? "Ocultar" : "Detalles"}
              </button>
            </div>
          </div>
        </div>
      </div>
      {mostrarDetalles && (
        <div
          style={{
            position: 'absolute',
            top: '0',
            left: '100%',
            marginLeft: '15px',
            width: '280px',
            height: '100%',
            backgroundColor: '#ffffff',
            border: '1px solid #e0e0e0',
            borderRadius: '12px',
            boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
            padding: '20px',
            zIndex: 100,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          {chatAbierto ? (
            /* =========================================
               VISTA 1: INTERFAZ DEL CHAT EN VIVO
               ========================================= */
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              {/* Cabecera del chat */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #f0f0f0', paddingBottom: '10px', marginBottom: '10px' }}>
                <h4 style={{ margin: 0, color: '#333' }}>Chat con Vendedor</h4>
                <button
                  onClick={() => setChatAbierto(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', color: '#888' }}
                  title="Volver a detalles"
                >
                  ✖
                </button>
              </div>

              {/* Contenedor de mensajes */}
              <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', paddingRight: '5px', marginBottom: '10px' }}>
                {mensajes.length === 0 ? (
                  <p style={{ fontSize: '0.85rem', color: '#aaa', textAlign: 'center', marginTop: '20px' }}>
                    Escribe un mensaje para consultar sobre este libro...
                  </p>
                ) : (
                  mensajes.map((msg, index) => {
                    const esMio = msg.remitente === usuarioActual?.uid;
                    return (
                      <div key={index} style={{
                        alignSelf: esMio ? 'flex-end' : 'flex-start',
                        backgroundColor: esMio ? '#0d6efd' : '#f1f3f5',
                        color: esMio ? 'white' : '#333',
                        padding: '8px 12px',
                        borderRadius: '12px',
                        maxWidth: '85%',
                        fontSize: '0.85rem',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                      }}>
                        <span style={{ display: 'block', wordWrap: 'break-word' }}>{msg.texto}</span>
                        <small style={{ fontSize: '0.65rem', opacity: 0.7, textAlign: esMio ? 'right' : 'left', display: 'block', marginTop: '4px' }}>
                          {msg.hora}
                        </small>
                      </div>
                    );
                  })
                )}

                {/* 👈 NUEVO: El div invisible que sirve como ancla para el scroll */}
                <div ref={mensajesEndRef} />

              </div>

              {/* Input y botón de enviar */}
              <div style={{ display: 'flex', gap: '5px' }}>
                <input
                  type="text"
                  value={nuevoMensaje}
                  onChange={(e) => setNuevoMensaje(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && enviarMensajeChat()}
                  placeholder="Escribe aquí..."
                  style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '0.85rem', outline: 'none' }}
                />
                <button
                  onClick={enviarMensajeChat}
                  style={{ backgroundColor: '#0d6efd', color: 'white', border: 'none', padding: '0 15px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  ➤
                </button>
              </div>
            </div>
          ) : (
            /* =========================================
               VISTA 2: DETALLES DEL LIBRO Y BOTONES
               ========================================= */
            <>
              <div>
                <h4 style={{ margin: '0 0 10px 0', borderBottom: '2px solid #f0f0f0', paddingBottom: '8px', color: '#333' }}>
                  Descripción del Vendedor
                </h4>
                <p style={{ fontSize: '0.95rem', color: '#555', lineHeight: '1.5', overflowY: 'auto', maxHeight: '250px' }}>
                  {descripcion || "El vendedor no proporcionó una descripción adicional para este libro."}
                </p>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                <button
                  onClick={() => setChatAbierto(true)}
                  style={{
                    flex: 1,
                    backgroundColor: '#0d6efd',
                    color: 'white',
                    border: 'none',
                    padding: '12px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '0.9rem',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                >
                  💬 Chat
                </button>

                <button
                  onClick={handleComprar}
                  style={{
                    flex: 1,
                    backgroundColor: '#635bff',
                    color: 'white',
                    border: 'none',
                    padding: '12px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '0.9rem',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                >
                  💳 Comprar
                </button>
              </div>
            </>
          )}
        </div>
      )}

    </div>
  );
};

export default LibroCard;