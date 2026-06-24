import React from 'react';
import { auth } from '../services/authService'; // Mantenemos solo el servicio de Auth local

const LibroCard = ({ libro }) => {
  // Desestructuramos, manejando id_firestore (del backend) o id tradicional
  const { 
    id_firestore,
    id,
    vendedor_id,
    descripcion, 
    precio, 
    nivel, 
    estado_fisico,   
    incluye_codigo, 
    imagen_url,      
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

  const formatearFecha = (timestamp) => {
    if (!timestamp) return '';
    // Si el backend envía el objeto Timestamp estructurado o un string ISO
    const fecha = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp);
    return isNaN(fecha) ? '' : fecha.toLocaleDateString('es-EC', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  

  return (
    <div className="libro-card">
      <div className="libro-badge-nivel">{nivel}</div>
      
      <div className="libro-imagen-contenedor">
        {/* Utilizamos imagen_url y el SVG integrado como respaldo si la foto aún no carga */}
        <img 
          src={imagen_url || "data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22300%22%20height%3D%22400%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22%23cccccc%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20font-family%3D%22sans-serif%22%20font-size%3D%2224%22%20fill%3D%22%23666666%22%20text-anchor%3D%22middle%22%20dy%3D%22.3em%22%3ESin%20Foto%3C%2Ftext%3E%3C%2Fsvg%3E"} 
          alt={`Portada del nivel ${nivel}`} 
          className="libro-imagen" 
        />
      </div>

      <div className="libro-info">
        <div className="libro-header">
          {/* El nivel ahora toma el lugar del título principal */}
          <h3 className="libro-titulo">{nivel}</h3>
          <span className="libro-precio">
            ${typeof precio === 'number' ? precio.toFixed(2) : parseFloat(precio) ? parseFloat(precio).toFixed(2) : '0.00'}
          </span>
        </div>

        <p className="libro-descripcion">{descripcion}</p>

        <div className="libro-detalles">
          {/* Reemplazamos la vieja lógica de estado por el booleano de estado_fisico */}
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