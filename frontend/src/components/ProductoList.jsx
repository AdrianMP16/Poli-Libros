import React from 'react';

export default function ProductoList({ productos, onEliminar, onActualizar }) {
  if (!productos || productos.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', opacity: 0.6 }}>
        <p>📚 El inventario de Polilibros está vacío.</p>
      </div>
    );
  }

  return (
    <section className="grid">
      {productos.map((p) => (
        <article className="card" key={p.id}>
          <div className="card-header">
            <h3 style={{ color: '#ffcc00', marginTop: 0 }}>{p.nombre}</h3>
            <span className="badge" style={{ 
              background: 'rgba(255,204,0,0.1)', 
              padding: '2px 8px', 
              borderRadius: '4px',
              fontSize: '0.8rem' 
            }}>{p.categoria}</span>
          </div>
          
          <div className="card-body" style={{ margin: '15px 0' }}>
            <p style={{ fontSize: '1.2rem' }}>
              <strong>💰 Precio:</strong> <span style={{ color: '#4ade80' }}>${p.precio}</span>
            </p>
          </div>

          <div className="card-actions" style={{ display: 'flex', gap: '10px' }}>
            <button 
              className="secondary" 
              style={{ flex: 1, fontSize: '0.8rem' }}
              onClick={() => {
                const nuevoPrecio = prompt('Nuevo precio para ' + p.nombre + ':', p.precio);
                if (nuevoPrecio !== null && !isNaN(nuevoPrecio)) {
                  onActualizar(p.id, { precio: Number(nuevoPrecio) });
                }
              }}
            >
              Editar precio
            </button>
            
            <button 
              className="danger" 
              style={{ flex: 1, fontSize: '0.8rem', background: '#440000' }}
              onClick={() => {
                if (window.confirm('¿Eliminar ' + p.nombre + '?')) {
                  onEliminar(p.id);
                }
              }}
            >
              Eliminar
            </button>
          </div>
        </article>
      ))}
    </section>
  );
}