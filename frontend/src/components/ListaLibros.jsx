import React, { useEffect, useState } from 'react';
import LibroCard from './LibroCard';
import '../styles/ListaLibros.css'; 
import { API_URL } from '../services/config';

const ListaLibros = () => {
  const [libros, setLibros] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const obtenerLibros = async () => {
      try {
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

  if (cargando) return <p className="loading-books-text">Cargando libros disponibles...</p>;

  return (
    <div className="books-list-wrapper">
      <h2 className="books-list-title">Libros Disponibles</h2>
      
      {libros.length === 0 ? (
        <p className="no-books-text">No hay libros publicados en este momento.</p>
      ) : (
        <div className="books-grid-layout">
          {libros.map((libro) => (
            <LibroCard key={libro.id_firestore || libro.id} libro={libro} onEliminar={handleEliminarLibro} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ListaLibros;