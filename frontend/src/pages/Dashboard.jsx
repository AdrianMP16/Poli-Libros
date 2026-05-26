import React, { useState } from 'react';
import ListaLibros from '../components/ListaLibros';

const Dashboard = ({ libros, onCrear, onEliminar, onActualizar }) => {
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    precio: '',
    nivel: 'Nivel 1',
    estado: 'Nuevo',
    incluye_codigo: false,
    fotos: []
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.titulo || !formData.precio) return;

    const nuevoLibro = {
      ...formData,
      precio: parseFloat(formData.precio),
      fecha_publicacion: new Date(),
      fotos: formData.fotos.length > 0 ? formData.fotos : ['https://via.placeholder.com/300x400?text=Sin+Portada']
    };

    await onCrear(nuevoLibro);
    
    setFormData({
      titulo: '',
      descripcion: '',
      precio: '',
      nivel: 'Nivel 1',
      estado: 'Nuevo',
      incluye_codigo: false,
      fotos: []
    });
  };

  return (
    <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '1.5rem', color: '#fff' }}>Panel de Compra-Venta</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem', alignItems: 'start' }}>
        
        <div style={{ background: '#1e1e1e', padding: '20px', borderRadius: '8px', color: '#fff' }}>
          <h2 style={{ marginBottom: '15px', fontSize: '1.2rem' }}>Publicar un Libro</h2>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            
            <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              Título del Libro:
              <input 
                type="text" 
                name="titulo" 
                value={formData.titulo} 
                onChange={handleChange} 
                required 
                style={{ padding: '8px', borderRadius: '4px', border: '1px solid #444', background: '#333', color: '#fff' }}
              />
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              Descripción:
              <textarea 
                name="descripcion" 
                value={formData.descripcion} 
                onChange={handleChange} 
                style={{ padding: '8px', borderRadius: '4px', border: '1px solid #444', background: '#333', color: '#fff', resize: 'vertical' }}
              />
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              Precio ($):
              <input 
                type="number" 
                name="precio" 
                step="0.01" 
                value={formData.precio} 
                onChange={handleChange} 
                required 
                style={{ padding: '8px', borderRadius: '4px', border: '1px solid #444', background: '#333', color: '#fff' }}
              />
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              Nivel de Inglés:
              <select 
                name="nivel" 
                value={formData.nivel} 
                onChange={handleChange}
                style={{ padding: '8px', borderRadius: '4px', border: '1px solid #444', background: '#333', color: '#fff' }}
              >
                <option value="Nivel 1">Nivel 1</option>
                <option value="Nivel 2">Nivel 2</option>
                <option value="Nivel 3">Nivel 3</option>
                <option value="Nivel 4">Nivel 4</option>
                <option value="Intensivo">Intensivo</option>
              </select>
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              Estado del Libro:
              <select 
                name="estado" 
                value={formData.estado} 
                onChange={handleChange}
                style={{ padding: '8px', borderRadius: '4px', border: '1px solid #444', background: '#333', color: '#fff' }}
              >
                <option value="Nuevo">Nuevo</option>
                <option value="Buen estado">Buen estado</option>
                <option value="Usado - Rayado">Usado - Rayado</option>
                <option value="Desgastado">Desgastado</option>
              </select>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginTop: '5px' }}>
              <input 
                type="checkbox" 
                name="incluye_codigo" 
                checked={formData.incluye_codigo} 
                onChange={handleChange} 
              />
              ¿Incluye código digital accesible?
            </label>

            <button 
              type="submit" 
              style={{ padding: '10px', background: '#ffc107', color: '#000', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}
            >
              Publicar Libro
            </button>
          </form>
        </div>

        <div style={{ background: '#1e1e1e', padding: '20px', borderRadius: '8px', color: '#fff' }}>
          <h2 style={{ marginBottom: '15px', fontSize: '1.2rem' }}>Mis publicaciones e inventario</h2>
          <ListaLibros />
        </div>

      </div>
    </main>
  );
};

export default Dashboard;