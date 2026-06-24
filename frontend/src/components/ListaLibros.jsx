import React, { useEffect, useState } from 'react';
import LibroCard from './LibroCard';
import '../styles/LibroCard.css'; 
import {API_URL} from '../services/config';

const ListaLibros = () => {
  const [libros, setLibros] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const obtenerLibros = async () => {
      try {
        // Consumimos tu backend estructurado en Express
        const res = await fetch(`${API_URL}/api/libros`);
        if (!res.ok) throw new Error("Error en la respuesta del servidor");
        
        const datos = await res.json();
        setLibros(datos);
      } catch (error) {
        console.error("Error al traer los libros del backend:", error);
      } finally {
        setCargando(false);
      }
    };

    obtenerLibros();
  }, []);

  const handleEliminarLibro = (idEliminado) => {
    setLibros((prevLibros) => prevLibros.filter((libro) => libro.id !== idEliminado));
  };

  if (cargando) return <p style={{ textAlign: 'center' }}>Cargando libros disponibles...</p>;

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ marginBottom: '20px', color: '#333' }}>Libros Disponibles</h2>
      
      {libros.length === 0 ? (
        <p>No hay libros publicados en este momento.</p>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '24px'
        }}>
          {libros.map((libro) => (
            /* Pasamos el id_firestore o id según cómo venga mapeado del backend */
            <LibroCard key={libro.id_firestore || libro.id} libro={libro} onEliminar={handleEliminarLibro} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ListaLibros;