import React, { useState, useEffect } from 'react';
import { auth } from '../services/authService'; // Mantenemos solo el servicio de Auth local
import { API_URL } from '../services/config'; // Importamos la URL base de tu backend
import { useNavigate } from 'react-router-dom'; // Para redireccionar después de eliminar

const LibroCard = ({ libro }) => {
  const navigate = useNavigate();
  const [usuarioActual, setUsuarioActual] = useState(null);
  const [mostrarDetalles, setMostrarDetalles] = useState(false);

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
          reason: motivo.trim()
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
            zIndex: 100, // Nos aseguramos que flote por encima de otras tarjetas
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <h4 style={{ margin: '0 0 10px 0', borderBottom: '2px solid #f0f0f0', paddingBottom: '8px', color: '#333' }}>
              Descripción del Vendedor
            </h4>
            <p style={{ fontSize: '0.95rem', color: '#555', lineHeight: '1.5', overflowY: 'auto', maxHeight: '250px' }}>
              {descripcion || "El vendedor no proporcionó una descripción adicional para este libro."}
            </p>
          </div>

          <button
            onClick={() => {
              // Lógica futura para abrir el chat
              console.log("Abrir chat para el libro:", id);
            }}
            style={{
              backgroundColor: '#0d6efd',
              color: 'white',
              border: 'none',
              padding: '12px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '1rem',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '8px',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#0b5ed7'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#0d6efd'}
          >
            💬 Chat
          </button>
        </div>
      )}

    </div>
  );
};

export default LibroCard;