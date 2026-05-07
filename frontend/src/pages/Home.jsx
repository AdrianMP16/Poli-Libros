import React from 'react';

export default function Home({ user, onLogout }) {
  // Datos de prueba para visualizar el Marketplace de libros
  const librosPrueba = [
    { id: 1, titulo: "Cálculo de una Variable", autor: "James Stewart", precio: 25.00, estado: "Usado" },
    { id: 2, titulo: "Física Universitaria", autor: "Sears-Zemansky", precio: 30.00, estado: "Como nuevo" },
    { id: 3, titulo: "Fundamentos de Programación", autor: "Luis Joyanes", precio: 15.00, estado: "Desgastado" },
  ];

  return (
    <div style={styles.container}>
      {/* Barra de navegación superior */}
      <header style={styles.header}>
        <h1>Poli-Libros 📚</h1>
        <div style={styles.userInfo}>
          <span>Bienvenido, <strong>{user?.email}</strong></span>
          <button onClick={onLogout} style={styles.logoutBtn}>Cerrar Sesión</button>
        </div>
      </header>

      {/* Sección principal del Marketplace */}
      <main style={styles.main}>
        <h2>Libros Disponibles en la EPN</h2>
        <p>Explora los libros publicados por otros estudiantes.</p>

        <div style={styles.grid}>
          {librosPrueba.map((libro) => (
            <div key={libro.id} style={styles.card}>
              <h3>{libro.titulo}</h3>
              <p>Autor: {libro.autor}</p>
              <p>Estado: <strong>{libro.estado}</strong></p>
              <div style={styles.priceTag}>${libro.precio.toFixed(2)}</div>
              <button style={styles.buyBtn}>Contactar Vendedor</button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

// Estilos rápidos en JS para que se vea bien de inmediato
const styles = {
  container: {
    backgroundColor: '#1a1a1a',
    color: '#ffffff',
    minHeight: '100vh',
    fontFamily: 'Arial, sans-serif',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 2rem',
    backgroundColor: '#242424',
    borderBottom: '1px solid #333',
  },
  userInfo: {
    display: 'flex',
    gap: '15px',
    alignItems: 'center',
  },
  logoutBtn: {
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    padding: '8px 15px',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  main: {
    padding: '2rem',
    maxWidth: '1000px',
    margin: '0 auto',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '20px',
    marginTop: '20px',
  },
  card: {
    backgroundColor: '#2a2a2a',
    padding: '1.5rem',
    borderRadius: '10px',
    border: '1px solid #444',
    textAlign: 'center',
  },
  priceTag: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#4CAF50',
    margin: '10px 0',
  },
  buyBtn: {
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '5px',
    cursor: 'pointer',
    width: '100%',
  }
};