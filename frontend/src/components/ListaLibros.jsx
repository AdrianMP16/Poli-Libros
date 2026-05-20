import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../services/firestore'; // Asegúrate de que apunte a tu archivo de configuración
import LibroCard from './LibroCard';
import '../styles/LibroCard.css'; // Importa los estilos

const ListaLibros = () => {
  const [libros, setLibros] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const obtenerLibros = async () => {
      try {
        // Hacemos una query ordenada por los más recientes primero
        const q = query(collection(db, 'libros'), orderBy('fecha_publicacion', 'desc'));
        const querySnapshot = await getDocs(q);
        
        const listaTemporal = [];
        querySnapshot.forEach((doc) => {
          // Guardamos los datos del documento y el ID de Firestore
          listaTemporal.push({ id: doc.id, ...doc.data() });
        });
        
        setLibros(listaTemporal);
      } catch (error) {
        console.error("Error al traer los libros de Firestore:", error);
      } finally {
        setCargando(false);
      }
    };

    obtenerLibros();
  }, []);

  if (cargando) return <p style={{ textAlign: 'center' }}>Cargando libros disponibles...</p>;

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ marginBottom: '20px', color: '#333' }}>Libros Disponibles</h2>
      
      {libros.length === 0 ? (
        <p>No hay libros publicados en este momento.</p>
      ) : (
        /* Grid responsivo para las tarjetas */
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '24px'
        }}>
          {libros.map((libro) => (
            <LibroCard key={libro.id} libro={libro} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ListaLibros;