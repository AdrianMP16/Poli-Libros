import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../services/config';
import '../styles/Landing.css';

function Landing({ libros = [], user }) {
  const navigate = useNavigate();
  const [anuncios, setAnuncios] = useState([]);

  useEffect(() => {
    const cargarAnuncios = async () => {
      try {
        const res = await fetch(`${API_URL}/api/anuncios`);
        if (res.ok) {
          const datos = await res.json();
          setAnuncios(datos);
        }
      } catch (error) {
        console.error("Error al cargar anuncios:", error);
      }
    };
    cargarAnuncios();
  }, []);

  return (
    <div className="landing-container">
      {/* 1. HERO SECTION */}
      <header className="landing-hero">
        <div className="hero-content">
          <h1 className="hero-title">PoliLibros <span className="hero-emoji">📚</span></h1>
          <p className="hero-description">
            La plataforma exclusiva para estudiantes del <strong>CEC-EPN</strong>. Compra y vende tus libros de inglés de forma segura y directa dentro del campus.
          </p>
          <div className="hero-actions">
            {user ? (
              <button className="btn-landing-primary" onClick={() => navigate('/dashboard')}>
                Ir a mi Panel de Ventas
              </button>
            ) : (
              <>
                <button className="btn-landing-primary" onClick={() => navigate('/login')}>
                  Buscar Libros (Comprar)
                </button>
                <button className="btn-landing-secondary" onClick={() => navigate('/login')}>
                  Publicar mi Libro (Vender)
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* SECCIÓN DE ANUNCIOS GLOBALES */}
      {anuncios.length > 0 && (
        <section className="admin-announcements-section">
          <div className="announcements-alert-box">
            <h3 className="announcements-box-title">📢 Avisos Importantes de Administración</h3>
            <div className="announcements-list">
              {anuncios.map(anuncio => (
                <div key={anuncio.id} className="announcement-item-card">
                  <h4 className="announcement-card-title">{anuncio.titulo}</h4>
                  <p className="announcement-card-body">{anuncio.mensaje}</p>
                  <small className="announcement-card-author">Por: {anuncio.autor}</small>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 2. BENEFICIOS */}
      <section className="landing-features-section">
        <h2 className="features-main-title">¿Por qué usar Polilibros?</h2>
        <div className="landing-grid-layout text-center">
          <div className="feature-item-box">
            <div className="feature-icon">💰</div>
            <h3>Ahorra Dinero</h3>
            <p>Consigue los libros originales del CEC a una fraction de su precio de librería.</p>
          </div>
          <div className="feature-item-box">
            <div className="feature-icon">🤝</div>
            <h3>Trato Directo</h3>
            <p>Coordina la entrega y el pago en efectivo o transferencia dentro de la Poli.</p>
          </div>
          <div className="feature-item-box">
            <div className="feature-icon">🔒</div>
            <h3>Solo Politécnicos</h3>
            <p>Plataforma pensada por y para la comunidad del CEC-EPN.</p>
          </div>
        </div>
      </section>

      {/* 3. VISTA PREVIA DE PRODUCTOS (PÚBLICA) */}
      <section className="landing-features-section preview-bg">
        <h2 className="features-main-title">Últimos libros publicados</h2>
        <p className="preview-subtitle">Inicia sesión para contactar al vendedor</p>

        {libros.length === 0 ? (
          <p className="empty-preview-text">No hay libros publicados esta semana. ¡Sé el primero!</p>
        ) : (
          <div className="landing-grid-layout">
            {libros
              .filter(prod => prod.disponibilidad !== false && prod.disponibilidad !== 'vendido')
              .slice(0, 6)
              .map((prod) => {
                const tituloLibro = prod.nivel ? `Libro de Inglés — Nivel ${prod.nivel}` : "Libro de Inglés";
                const imagenLibro = prod.imagen_url;
                const estadoLibro = prod.estado_physical || prod.estado_fisico;
                const tieneCodigo = prod.incluye_codigo;

                return (
                  <div key={prod.id || prod.id_firestore} className="preview-product-card">
                    
                    {/* Contenedor de la Imagen */}
                    <div className="product-card-image-wrapper">
                      {imagenLibro ? (
                        <img 
                          src={imagenLibro} 
                          alt={`Portada de ${tituloLibro}`} 
                          className="product-card-img" 
                        />
                      ) : (
                        <div className="product-card-placeholder">
                          <span>📖</span>
                        </div>
                      )}
                      
                      {/* Badges Flotantes */}
                      <div className="card-badges-container">
                        {estadoLibro && <span className="badge-status">{estadoLibro}</span>}
                        {tieneCodigo && <span className="badge-code">Con Código ✔</span>}
                      </div>
                    </div>

                    {/* Detalles del Libro */}
                    <div className="product-card-body-content">
                      <h4 className="product-card-title">{tituloLibro}</h4>
                      {prod.descripcion && <p className="product-card-description">{prod.descripcion}</p>}
                      <div className="product-card-divider"></div>
                      <p className="product-card-price">
                        ${typeof prod.precio === 'number' ? prod.precio.toFixed(2) : parseFloat(prod.precio) ? parseFloat(prod.precio).toFixed(2) : '0.00'}
                      </p>
                    </div>

                    {/* Acción */}
                    <button
                      className="btn-card-action"
                      onClick={() => navigate('/login')}
                    >
                      Ver vendedor
                    </button>
                  </div>
                );
              })}
          </div>
        )}
      </section>

      {/* 4. FOOTER */}
      <footer className="landing-footer">
        <p>© {new Date().getFullYear()} Polilibros — Desarrollado para la comunidad del CEC-EPN</p>
      </footer>
    </div>
  );
}

export default Landing;