// src/components/LibroCard.jsx
import React, { useState, useEffect } from 'react';
import { auth } from '../services/authService'; 
import { API_URL } from '../services/config'; 
import { useNavigate } from 'react-router-dom'; 
import '../styles/LibroCard.css';

const LibroCard = ({ libro, onEliminar }) => {
  const navigate = useNavigate();
  const [usuarioActual, setUsuarioActual] = useState(null);
  const [mostrarDetalles, setMostrarDetalles] = useState(false);

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
          chatHistory: []
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
        if (onEliminar) onEliminar(id); 
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
      const studentName = usuarioActual.displayName || "Estudiante";
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
    const fecha = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp);
    return isNaN(fecha) ? '' : fecha.toLocaleDateString('es-EC', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="libro-card-wrapper">

      <div className="libro-card" style={{ opacity: disponibilidad ? 1 : 0.6 }}>

        {!disponibilidad && (
          <div className="libro-badge-vendido">
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
                color: 'white'
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

          <div className="libro-footer">
            <small className="libro-fecha">Publicado: {formatearFecha(fecha_publicacion)}</small>

            <div style={{ display: 'flex', gap: '8px' }}>
              {usuarioActual && usuarioActual.uid === vendedor_id ? (
                <button onClick={handleEliminar} className="libro-btn-eliminar">
                  🗑️ Eliminar
                </button>
              ) : (
                <button onClick={handleReport} className="libro-btn-reportar">
                  ⚠️ Reportar
                </button>
              )}

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
        <div className="libro-panel-detalles">
          <div>
            <h4 className="detalles-descripcion-titulo">
              Descripción del Vendedor
            </h4>
            <p className="detalles-descripcion-texto">
              {descripcion || "El vendedor no proporcionó una descripción adicional para este libro."}
            </p>
          </div>

          <div className="detalles-footer-acciones" style={{ display: 'flex', justifyContent: 'center', marginTop: '15px' }}>
            <button onClick={handleComprar} className="btn-accion-comprar" style={{ width: '100%' }}>
              💳 Comprar
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default LibroCard;