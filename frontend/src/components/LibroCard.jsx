import React from 'react';
import { auth } from '../services/authService'; // Mantenemos solo el servicio de Auth local

const LibroCard = ({ libro }) => {
  // Desestructuramos, manejando id_firestore (del backend) o id tradicional
  const { 
    id_firestore,
    id,
    vendedor_id,
    titulo, 
    descripcion, 
    precio, 
    nivel, 
    estado, 
    incluye_codigo, 
    fotos, 
    fecha_publicacion 
  } = libro;

  const bookId = id_firestore || id;

  const handleReport = async (e) => {
    e.stopPropagation(); 

    if (!auth.currentUser) {
      return alert("Debes iniciar sesión para poder reportar una publicación.");
    }
    
    if (vendedor_id === auth.currentUser.uid) {
      return alert("No puedes reportar tu propio libro.");
    }

    const motivo = prompt("Escribe la razón del reporte (ej. Precio falso, Estafa, Contenido inapropiado):");
    if (!motivo || motivo.trim() === "") return; 

    try {
      // 1. OBTENER EL TOKEN ASINCRÓNICAMENTE DESDE FIREBASE AUTH
      const token = await auth.currentUser.getIdToken();

      // 2. ENVIAR EL REPORTE A EXPRESS CON EL TOKEN DE SEGURIDAD
      const res = await fetch("http://localhost:3000/api/reportes", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` // 👈 Tu middleware 'verificarAutenticado' leerá esto
        },
        body: JSON.stringify({
          reportedBy: auth.currentUser.uid,
          reportedUser: vendedor_id, 
          bookId: bookId,                
          bookTitle: titulo,
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

  const formatearFecha = (timestamp) => {
    if (!timestamp) return '';
    // Si el backend envía el objeto Timestamp estructurado o un string ISO
    const fecha = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp);
    return isNaN(fecha) ? '' : fecha.toLocaleDateString('es-EC', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const imagenPortada = fotos && fotos.length > 0 ? fotos[0] : 'https://via.placeholder.com/300x400?text=Sin+Portada';

  return (
    <div className="libro-card">
      <div className="libro-badge-nivel">{nivel}</div>
      
      <div className="libro-imagen-contenedor">
        <img src={imagenPortada} alt={`Portada de ${titulo}`} className="libro-imagen" />
      </div>

      <div className="libro-info">
        <div className="libro-header">
          <h3 className="libro-titulo">{titulo}</h3>
          <span className="libro-precio">
            ${typeof precio === 'number' ? precio.toFixed(2) : parseFloat(precio) ? parseFloat(precio).toFixed(2) : '0.00'}
          </span>
        </div>

        <p className="libro-descripcion">{descripcion}</p>

        <div className="libro-detalles">
          {/* 🛡️ PROTECCIÓN ANTI-PANTALLA EN NEGRO AQUÍ */}
          <span className={`badge-estado estado-${(estado || "nuevo").toLowerCase().replace(/ /g, '-')}`}>
            Estado: {estado || "No especificado"}
          </span>
          
          {incluye_codigo ? (
            <span className="badge-codigo codigo-si">Código Digital ✔</span>
          ) : (
            <span className="badge-codigo codigo-no">Sin Código ✘</span>
          )}
        </div>

        <div className="libro-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <small className="libro-fecha">Publicado: {formatearFecha(fecha_publicacion)}</small>
          
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={handleReport}
              style={{ 
                backgroundColor: '#dc3545', 
                color: 'white', 
                border: 'none', 
                padding: '6px 10px', 
                borderRadius: '4px', 
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '0.85rem'
              }}
            >
              ⚠️ Reportar
            </button>
            <button className="btn-ver-mas">Ver Detalles</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LibroCard;