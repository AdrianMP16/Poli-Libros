// src/components/Sidebar.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../services/authService';
import { signOut } from 'firebase/auth';
import '../styles/Sidebar.css';

const Sidebar = ({ user, esAdmin, isOpen, onClose }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.clear();
      navigate('/');
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      alert("No se pudo cerrar la sesión correctamente.");
    }
  };

  return (
    <div 
      className="sidebar-container" 
      style={{ transform: isOpen ? 'translateX(0)' : 'translateX(-100%)' }}
    >
      <button onClick={onClose} className="sidebar-btn-close">
        ✖
      </button>

      {/* Sección Superior: Información del Perfil */}
      <div className="sidebar-top-section">
        <h2 className="sidebar-brand">📚 Polilibros</h2>
        
        {user ? (
          <div className="sidebar-profile-card">
            <p className="sidebar-profile-name">
              {user?.displayName || "Usuario"}
            </p>
            <p className="sidebar-profile-email">
              {user?.email}
            </p>
            <span className={`sidebar-role-badge ${esAdmin ? 'admin' : 'estudiante'}`}>
              {esAdmin ? 'Panel Administrador' : 'Estudiante'}
            </span>
          </div>
        ) : (
          <p className="sidebar-no-session">Sin sesión activa</p>
        )}

        {/* Menú de Navegación Dinámico */}
        <nav className="sidebar-nav-menu">
          <button onClick={() => navigate(esAdmin ? '/admin' : '/')} className="sidebar-menu-btn">
            🏠 Inicio
          </button>
          {!esAdmin && (
            <button onClick={() => navigate('/')} className="sidebar-menu-btn">
              📊 Mi Panel de Estudiante
            </button>
          )}
        </nav>
      </div>

      {/* Sección Inferior: Botón de Salida */}
      <button onClick={handleLogout} className="sidebar-btn-logout">
        🚪 Cerrar Sesión
      </button>
    </div>
  );
};

export default Sidebar;