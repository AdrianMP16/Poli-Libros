// frontend/src/components/Sidebar.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../services/authService';
import { signOut } from 'firebase/auth';

const Sidebar = ({ user, esAdmin, isOpen, onClose }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // 1. Forzamos el cierre de sesión en Firebase
      await signOut(auth);
      // 2. Limpiamos cualquier residuo manual que haya quedado
      localStorage.clear();
      // 3. Redirigimos con fuerza a la Landing Page
      navigate('/');
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      alert("No se pudo cerrar la sesión correctamente.");
    }
  };

  return (
    <div style={{
      width: '260px',
      height: '100vh',
      backgroundColor: '#1a1a1a',
      color: '#fff',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      position: 'fixed',
      left: 0,
      top: 0,
      boxShadow: '2px 0 5px rgba(0,0,0,0.3)',
      zIndex: 1000,

      transition: 'transform 0.3s ease-in-out',
      transform: isOpen ? 'translateX(0)' : 'translateX(-100%)', // Si está cerrado, se mueve 100% a la izquierda (fuera de la pantalla)
    }}>
      {/* 3. Añadimos un botón "X" en la esquina superior derecha para cerrarlo */}
      <button 
        onClick={onClose}
        style={{
          position: 'absolute',
          top: '15px',
          right: '15px',
          background: 'none',
          border: 'none',
          color: '#aaa',
          fontSize: '1.2rem',
          cursor: 'pointer'
        }}
      >
        ✖
      </button>

      {/* Sección Superior: Información del Perfil */}
      <div style={{ marginTop: '20px' }}>
        <h2 style={{ color: '#f1c40f', marginBottom: '30px', fontSize: '1.5rem' }}>📚 Polilibros</h2>
        
        {user ? (
          <div style={{ backgroundColor: '#2d2d2d', padding: '12px', borderRadius: '6px', marginBottom: '20px' }}>
            <p style={{ margin: 0, fontWeight: 'bold', fontSize: '0.95rem', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.displayName || "Usuario"}
            </p>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#aaa' }}>
              {user?.email}
            </p>
            <span style={{
              display: 'inline-block',
              marginTop: '8px',
              padding: '2px 8px',
              borderRadius: '12px',
              fontSize: '0.75rem',
              fontWeight: 'bold',
              backgroundColor: esAdmin ? '#dc3545' : '#28a745',
              color: '#fff'
            }}>
              {esAdmin ? 'Panel Administrador' : 'Estudiante'}
            </span>
          </div>
        ) : (
          <p style={{ color: '#aaa' }}>Sin sesión activa</p>
        )}

        {/* Menú de Navegación Dinámico */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
          <button onClick={() => navigate(esAdmin ? '/admin' : '/dashboard')} style={styles.menuBtn}>
            🏠 Inicio
          </button>
          {!esAdmin && (
            <button onClick={() => navigate('/')} style={styles.menuBtn}>
              🛒 Ver Tienda Pública
            </button>
          )}
        </nav>
      </div>

      {/* Sección Inferior: Botón de Salida */}
      <button onClick={handleLogout} style={styles.logoutBtn}>
        🚪 Cerrar Sesión
      </button>
    </div>
  );
};

const styles = {
  menuBtn: {
    width: '100%',
    padding: '10px',
    textAlign: 'left',
    background: 'none',
    border: 'none',
    color: '#ccc',
    cursor: 'pointer',
    fontSize: '0.95rem',
    borderRadius: '4px',
    transition: 'background 0.2s',
    outline: 'none',
  },
  logoutBtn: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#dc3545',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '0.95rem',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
  }
};

// Pequeño efecto hover simulado para los botones
styles.menuBtn[':hover'] = { background: '#2d2d2d', color: '#fff' };

export default Sidebar;