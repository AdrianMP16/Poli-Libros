import React from 'react';

const LibroCard = ({ libro }) => {
  // Desestructuramos los campos del libro
  const { 
    titulo, 
    descripcion, 
    precio, 
    nivel, 
    estado, 
    incluye_codigo, 
    fotos, 
    fecha_publicacion 
  } = libro;

  // Formatear la fecha de Firebase Timestamp a algo legible
  const formatearFecha = (timestamp) => {
    if (!timestamp) return '';
    // Si viene de Firestore como Timestamp tiene el método toDate()
    const fecha = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return fecha.toLocaleDateString('es-EC', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  // Imagen por defecto si el array de fotos está vacío
  const imagenPortada = fotos && fotos.length > 0 
    ? fotos[0] 
    : 'https://via.placeholder.com/300x400?text=Sin+Portada';

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
          <span className={`badge-estado estado-${estado.toLowerCase().replace(/ /g, '-')}`}>
            Estado: {estado}
          </span>
          
          {incluye_codigo ? (
            <span className="badge-codigo codigo-si">Código Digital ✔</span>
          ) : (
            <span className="badge-codigo codigo-no">Sin Código ✘</span>
          )}
        </div>

        <div className="libro-footer">
          <small className="libro-fecha">Publicado: {formatearFecha(fecha_publicacion)}</small>
          <button className="btn-ver-mas">Ver Detalles</button>
        </div>
      </div>
    </div>
  );
};

export default LibroCard;