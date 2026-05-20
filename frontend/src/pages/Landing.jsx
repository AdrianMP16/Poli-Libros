import React from 'react';
import { useNavigate } from 'react-router-dom';

function Landing({ productos, user }) {
  const navigate = useNavigate();

  // Estilos rápidos en línea (puedes pasarlos a CSS después)
  const styles = {
    hero: {
      background: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)', // Azul politécnico oscuro
      color: '#fff',
      padding: '4rem 2rem',
      textAlign: 'center',
    },
    btnPrimary: {
      background: '#f1c40f', // Dorado/Amarillo EPN
      color: '#0f2027',
      border: 'none',
      padding: '0.8rem 1.5rem',
      fontSize: '1rem',
      fontWeight: 'bold',
      borderRadius: '5px',
      cursor: 'pointer',
      margin: '0.5rem',
    },
    btnSecondary: {
      background: 'transparent',
      color: '#fff',
      border: '2px solid #fff',
      padding: '0.8rem 1.5rem',
      fontSize: '1rem',
      borderRadius: '5px',
      cursor: 'pointer',
      margin: '0.5rem',
    },
    section: {
      padding: '3rem 2rem',
      maxWidth: '1200px',
      margin: '0 auto',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '1.5rem',
      marginTop: '1.5rem',
    },
    card: {
      border: '1px solid #ddd',
      borderRadius: '8px',
      padding: '1rem',
      boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
      textAlign: 'center'
    }
  };

  return (
    <div>
      {/* 1. HERO SECTION */}
      <header style={styles.hero}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Polilibros 📚</h1>
        <p style={{ fontSize: '1.2rem', marginBottom: '2rem', maxWidth: '600px', margin: '0 auto 2rem' }}>
          La plataforma exclusiva para estudiantes del **CEC-EPN**. Compra y vende tus libros de inglés de forma segura dentro del campus.
        </p>
        <div>
          {user ? (
            <button style={styles.btnPrimary} onClick={() => navigate('/dashboard')}>
              Ir a mi Panel de Ventas
            </button>
          ) : (
            <>
              <button style={styles.btnPrimary} onClick={() => navigate('/login')}>
                Buscar Libros (Comprar)
              </button>
              <button style={styles.btnSecondary} onClick={() => navigate('/login')}>
                Publicar mi Libro (Vender)
              </button>
            </>
          )}
        </div>
      </header>

      {/* 2. BENEFICIOS */}
      <section style={styles.section}>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>¿Por qué usar Polilibros?</h2>
        <div style={styles.grid}>
          <div style={{ textAlign: 'center' }}>
            <h3>💰 Ahorra Dinero</h3>
            <p>Consigue los libros originales del CEC a una fracción de su precio de librería.</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <h3>🤝 Trato Directo</h3>
            <p>Coordina la entrega y el pago en efectivo o transferencia dentro de la Poli.</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <h3>🔒 Solo Politécnicos</h3>
            <p>Plataforma pensada por y para la comunidad del CEC-EPN.</p>
          </div>
        </div>
      </section>

      {/* 3. VISTA PREVIA DE PRODUCTOS (PÚBLICA) */}
      <section style={{ ...styles.section, background: '#f9f9f9', borderRadius: '8px' }}>
        <h2 style={{ textAlign: 'center' }}>Últimos libros publicados</h2>
        <p style={{ textAlign: 'center', color: '#666' }}>Inicia sesión para contactar al vendedor</p>
        
        {productos.length === 0 ? (
          <p style={{ textAlign: 'center', marginTop: '2rem' }}>No hay libros publicados esta semana. ¡Sé el primero!</p>
        ) : (
          <div style={styles.grid}>
            {productos.slice(0, 6).map((prod) => (
              <div key={prod.id} style={styles.card}>
                <h4 style={{ margin: '0.5rem 0' }}>{prod.nombre || "Libro de Inglés"}</h4>
                <p style={{ color: '#0f2027', fontWeight: 'bold', fontSize: '1.2rem' }}>
                  ${prod.precio || "0.00"}
                </p>
                <p style={{ fontSize: '0.9rem', color: '#777' }}>Estado: {prod.estado || "Buen estado"}</p>
                <button 
                  style={{ ...styles.btnPrimary, width: '100%', marginTop: '1rem', padding: '0.5rem' }}
                  onClick={() => navigate('/login')}
                >
                  Ver vendedor
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 4. FOOTER */}
      <footer style={{ backgroundColor: '#0f2027', color: '#fff', textAlign: 'center', padding: '1.5rem', marginTop: '4rem' }}>
        <p>© {new Date().getFullYear()} Polilibros - Hecho para el CEC-EPN</p>
      </footer>
    </div>
  );
}

export default Landing;