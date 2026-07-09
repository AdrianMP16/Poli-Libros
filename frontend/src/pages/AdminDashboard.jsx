// src/pages/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { auth } from '../services/authService';
import Sidebar from '../components/Sidebar';
import ListaLibros from '../components/ListaLibros';
import { API_URL } from '../services/config';
import '../styles/AdminDashboard.css';

const AdminDashboard = ({ libros, onCrear, onEliminar, onActualizar }) => {
  const [pestana, setPestana] = useState('reportes');
  const [sidebarAbierto, setSidebarAbierto] = useState(false);
  const [reportes, setReportes] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [anuncios, setAnuncios] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [libroFiltro, setLibroFiltro] = useState(null);
  const [imagen, setImagen] = useState(null);
  const [subiendo, setSubiendo] = useState(false);

  const [formData, setFormData] = useState({
    nivel: 'Begginer', descripcion: '', precio: '', incluye_codigo: false, estado_fisico: ''
  });

  const [anuncioData, setAnuncioData] = useState({ titulo: '', mensaje: '' });
  const [mensajeAnuncio, setMensajeAnuncio] = useState('');

  const handleInvalidarReporte = async (idReporte) => {
    if (!window.confirm("¿Seguro que deseas descartar este reporte?")) return;
    try {
      const token = await auth.currentUser.getIdToken();
      const res = await fetch(`${API_URL}/api/reportes/${idReporte}/invalidar`, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        setReportes(reportes.filter(rep => rep.id !== idReporte));
      }
    } catch (error) {
      console.error("Error al invalidar:", error);
    }
  };

  const handleAplicarStrike = async (uidUsuario) => {
    if (!window.confirm("¿Enviar 1 strike a este usuario? A los 3 strikes será baneado.")) return;
    try {
      const token = await auth.currentUser.getIdToken();
      const res = await fetch(`${API_URL}/api/usuarios/${uidUsuario}/strike`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        alert(data.mensaje);
      }
    } catch (error) {
      console.error("Error al dar strike:", error);
    }
  };

  const irAGestionDeLibro = (idLibro) => {
    setLibroFiltro(idLibro);
    setPestana('libros_global');
  };

  const suspenderUsuario = async (uid) => {
    const token = await auth.currentUser.getIdToken();
    await fetch(`${API_URL}/api/usuarios/${uid}/deshabilitar`, {
      method: "PUT", headers: { Authorization: `Bearer ${token}` }
    });
    cargarUsuariosLocales();
  };

  const habilitarUsuario = async (uid) => {
    const token = await auth.currentUser.getIdToken();
    await fetch(`${API_URL}/api/usuarios/${uid}/habilitar`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({})
    });
    cargarUsuariosLocales();
  };

  const cargarUsuariosLocales = async () => {
    if (auth.currentUser) {
      try {
        const token = await auth.currentUser.getIdToken();
        const res = await fetch(`${API_URL}/api/usuarios`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) setUsuarios(await res.json());
      } catch (error) {
        console.error("Error al cargar usuarios:", error);
      }
    }
  };

  const cargarAnuncios = async () => {
    try {
      const res = await fetch(`${API_URL}/api/anuncios`);
      if (res.ok) setAnuncios(await res.json());
    } catch (error) {
      console.error("Error al cargar anuncios:", error);
    }
  };

  useEffect(() => {
    const cargarReportes = async () => {
      if (pestana === 'reportes' && auth.currentUser) {
        setCargando(true);
        try {
          const token = await auth.currentUser.getIdToken();
          const res = await fetch(`${API_URL}/api/reportes/pendientes`, {
            headers: { "Authorization": `Bearer ${token}` }
          });
          if (res.ok) {
            setReportes(await res.json());
          }
        } catch (error) {
          console.error("Error de conexión:", error);
        } finally {
          setCargando(false);
        }
      }
    };
    cargarReportes();
  }, [pestana]);

  useEffect(() => {
    if (pestana === 'usuarios') cargarUsuariosLocales();
    if (pestana === 'anuncios') cargarAnuncios();
  }, [pestana]);

  const handleSubmitLibro = async (e) => {
    e.preventDefault();
    if (!formData.nivel || !formData.precio) return alert("Nivel y precio obligatorios");
    if (!imagen) return alert("Por favor, sube una foto del libro.");

    setSubiendo(true);
    const formDataToSend = new FormData();
    formDataToSend.append("nivel", formData.nivel);
    formDataToSend.append("descripcion", formData.descripcion);
    formDataToSend.append("precio", formData.precio);
    formDataToSend.append("incluye_codigo", formData.incluye_codigo);
    formDataToSend.append("estado_fisico", formData.estado_fisico);
    formDataToSend.append("imagen", imagen);

    await onCrear(formDataToSend);

    setFormData({ nivel: 'Begginer', descripcion: '', precio: '', incluye_codigo: false, estado_fisico: '' });
    setImagen(null);
    document.getElementById('file-input-libro').value = '';
    setSubiendo(false);
  };

  const handleCrearAnuncio = async (e) => {
    e.preventDefault();
    setMensajeAnuncio('');
    try {
      const token = await auth.currentUser.getIdToken();
      const res = await fetch(`${API_URL}/api/anuncios`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          titulo: anuncioData.titulo,
          mensaje: anuncioData.mensaje,
          autor: auth.currentUser?.displayName || "Administración"
        })
      });

      if (res.ok) {
        setMensajeAnuncio("✅ Anuncio publicado exitosamente.");
        setAnuncioData({ titulo: '', mensaje: '' });
        cargarAnuncios();
      } else {
        const errorData = await res.json();
        setMensajeAnuncio("Error en el servidor: " + errorData.mensaje);
      }
    } catch (error) {
      setMensajeAnuncio("Error de conexión: " + error.message);
    }
  };

  const handleEliminarAnuncio = async (idAnuncio) => {
    if (!window.confirm("¿Estás seguro de eliminar este anuncio? Desaparecerá de la vista pública.")) return;
    try {
      const token = await auth.currentUser.getIdToken();
      const res = await fetch(`${API_URL}/api/anuncios/${idAnuncio}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (res.ok) {
        setAnuncios(anuncios.filter(a => a.id !== idAnuncio));
        setMensajeAnuncio("✅ Anuncio eliminado.");
      } else {
        alert("No se pudo eliminar el anuncio.");
      }
    } catch (error) {
      console.error("Error al eliminar el anuncio:", error);
    }
  };

  return (
    <div className="admin-wrapper">
      <Sidebar user={auth.currentUser} esAdmin={true} isOpen={sidebarAbierto} onClose={() => setSidebarAbierto(false)} />

      {/* Manejamos dinámicamente el layout para que responda elegantemente al Sidebar */}
      <div 
        className="admin-container"
        style={{ 
          marginLeft: sidebarAbierto ? '260px' : '0px',
          transition: 'margin-left 0.3s ease-in-out'
        }}
      >
        <button onClick={() => setSidebarAbierto(true)} className="btn-toggle-sidebar">
          ☰ Abrir Menú
        </button>
        <h2>Panel de Administración Global</h2>

        <div className="admin-tabs-container">
          <button onClick={() => setPestana('reportes')} className={`tab-btn ${pestana === 'reportes' ? 'active-admin' : ''}`}>🚨 Reportes</button>
          <button onClick={() => setPestana('usuarios')} className={`tab-btn ${pestana === 'usuarios' ? 'active-admin' : ''}`}>⚙️ Control de Usuarios</button>
          <button onClick={() => setPestana('libros_global')} className={`tab-btn ${pestana === 'libros_global' ? 'active-admin' : ''}`}>📚 Gestión de Libros</button>
          <button onClick={() => setPestana('anuncios')} className={`tab-btn ${pestana === 'anuncios' ? 'active-announcement' : ''}`}>📢 Publicar Anuncios</button>
        </div>

        {cargando && <p className="admin-loading-text">Cargando información del servidor...</p>}

        {/* Pestaña: Anuncios */}
        {pestana === 'anuncios' && (
          <div className="admin-grid-two-cols">
            <div className="admin-card-form">
              <h3 className="admin-section-title dark-text">Publicar un Anuncio</h3>
              <form onSubmit={handleCrearAnuncio} className="admin-form">
                <input type="text" placeholder="Título del anuncio" value={anuncioData.titulo} onChange={(e) => setAnuncioData({ ...anuncioData, titulo: e.target.value })} required className="admin-input" />
                <textarea placeholder="Contenido del mensaje..." value={anuncioData.mensaje} onChange={(e) => setAnuncioData({ ...anuncioData, mensaje: e.target.value })} required className="admin-textarea" />
                <button type="submit" className="btn-primary-action">Publicar Anuncio</button>
                {mensajeAnuncio && <p className="admin-status-message">{mensajeAnuncio}</p>}
              </form>
            </div>

            <div>
              <h3 className="admin-section-title dark-text">Anuncios Activos</h3>
              {anuncios.length === 0 ? (
                <p>No hay anuncios publicados.</p>
              ) : (
                anuncios.map(anuncio => (
                  <div key={anuncio.id} className="admin-card-item">
                    <h4>{anuncio.titulo}</h4>
                    <p className="admin-card-body-text">{anuncio.mensaje}</p>
                    <button onClick={() => handleEliminarAnuncio(anuncio.id)} className="btn-danger-action">
                      🗑️ Borrar Anuncio
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Pestaña: Libros Globales */}
        {pestana === 'libros_global' && (
          <div>
            {libroFiltro && (
              <div className="moderation-alert-panel">
                <div className="moderation-alert-header">
                  <h3>🚨 Modo de Moderación Activo</h3>
                  <button onClick={() => setLibroFiltro(null)} className="btn-close-filter">✖ Cerrar Filtro</button>
                </div>

                {(() => {
                  const libroEnCuestion = libros.find(l => l.id === libroFiltro || l.id_firestore === libroFiltro);
                  if (libroEnCuestion) {
                    return (
                      <div className="moderation-alert-content">
                        <p><strong>Título:</strong> {libroEnCuestion.titulo}</p>
                        <p><strong>ID Vendedor:</strong> {libroEnCuestion.vendedor_id}</p>
                        <div className="flex-gap-container">
                          <button onClick={() => onEliminar(libroEnCuestion.id || libroEnCuestion.id_firestore)} className="btn-danger-action p-10 font-bold-medium">
                            🗑️ Borrar Publicación
                          </button>
                          <button onClick={() => handleAplicarStrike(libroEnCuestion.vendedor_id)} className="btn-danger-action btn-strike font-bold-medium">
                            ⚠️ Enviar 1 Strike al Usuario
                          </button>
                        </div>
                      </div>
                    );
                  } else {
                    return <p className="moderation-alert-empty">El libro ya no existe o fue eliminado.</p>;
                  }
                })()}
              </div>
            )}

            <div className="admin-grid-two-cols">
              <div>
                <h3 className="admin-section-title dark-text">Publicar un Libro (Admin)</h3>
                <form onSubmit={handleSubmitLibro} className="admin-book-form">
                  <div className="admin-form-half-grid">
                    <label className="form-label-block">
                      Precio ($) *
                      <input type="number" step="0.01" value={formData.precio} onChange={(e) => setFormData({ ...formData, precio: e.target.value })} required className="admin-input normal-weight" placeholder="Ej: 15.50" />
                    </label>
                  </div>

                  <label className="form-label-block">
                    Descripción
                    <textarea value={formData.descripcion} onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })} className="admin-textarea normal-weight" placeholder="Detalla si tiene rayones, páginas dobladas, etc." />
                  </label>

                  <div className="form-row-grid">
                    <label className="form-label-block">
                      Nivel
                      <select value={formData.nivel} onChange={(e) => setFormData({ ...formData, nivel: e.target.value })} className="admin-select normal-weight">
                        <option value="Begginer">Begginer</option>
                        <option value="Basico 1">Básico 1</option>
                        <option value="Basico 2">Básico 2</option>
                        <option value="Intermedio 1">Intermedio 1</option>
                        <option value="Intermedio 2">Intermedio 2</option>
                        <option value="Avanzado 1">Avanzado 1</option>
                        <option value="Avanzado 2">Avanzado 2</option>
                        <option value="Academico 1">Académico 1</option>
                        <option value="Academico 2">Académico 2</option>
                        <option value="Academico 3">Académico 3</option>
                        <option value="Academico 4">Académico 4</option>
                      </select>
                    </label>

                    <label className="form-label-block">
                      Estado
                      <select value={formData.estado_fisico} onChange={(e) => setFormData({ ...formData, estado_fisico: e.target.value })} className="admin-select normal-weight">
                        <option value="Usado">Con marcas de esfero o sellos</option>
                        <option value="Usado 2">Con apuntes en lápiz</option>
                      </select>
                    </label>

                    <label className="form-label-block">
                      Foto del Libro *
                      <input id="file-input-libro" type="file" accept="image/*" onChange={(e) => setImagen(e.target.files[0])} required className="admin-input normal-weight" />
                    </label>

                    <label className="form-label-checkbox">
                      <input type="checkbox" checked={formData.incluye_codigo} onChange={(e) => setFormData({ ...formData, incluye_codigo: e.target.checked })} className="checkbox-input" />
                      Incluye código web
                    </label>
                  </div>

                  <button type="submit" className="btn-secondary-action">
                    Publicar Libro
                  </button>
                </form>

                <h3 className="admin-section-title dark-text border-bottom-dark">Mis Libros Publicados</h3>
              </div>

              <div>
                <h3 className="admin-section-title dark-text">Catálogo Global</h3>
                <ListaLibros
                  libros={libroFiltro ? libros.filter(l => l.id === libroFiltro || l.id_firestore === libroFiltro) : libros}
                  onEliminar={onEliminar}
                  onActualizar={onActualizar}
                />
              </div>
            </div>
          </div>
        )}

        {/* Pestaña: Reportes */}
        {!cargando && pestana === 'reportes' && (
          <div>
            <h3>Bandeja de Reportes Pendientes</h3>
            {reportes.length === 0 ? (
              <p>No hay reportes que revisar por el momento. ¡Buen trabajo!</p>
            ) : (
              reportes.map(rep => (
                <div key={rep.id} className="admin-card-item">
                  <p><strong>Libro Reportado:</strong> {rep.bookTitle}</p>
                  <p><strong>Motivo del Reporte:</strong> {rep.reason}</p>
                  <p><small>ID del Infractor: {rep.reportedUser}</small></p>

                  <div className="flex-gap-container">
                    <button onClick={() => irAGestionDeLibro(rep.bookId)} className="tab-btn btn-view-pub">
                      🔍 Ver Publicación
                    </button>
                    <button onClick={() => handleInvalidarReporte(rep.id)} className="tab-btn btn-invalidate-report">
                      ❌ Invalidar Reporte
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Pestaña: Usuarios */}
        {pestana === 'usuarios' && (
          <div className="user-control-panel">
            <h3>Control de Usuarios (API)</h3>
            {usuarios.map(usuario => (
              <div key={usuario.uid} className="user-control-card">
                <h4>{usuario.nombre || usuario.displayName}</h4>
                <p className="user-control-email">{usuario.email}</p>

                <div className="flex-gap-container">
                  <button onClick={() => suspenderUsuario(usuario.uid)} className="tab-btn btn-suspend-user">
                    🚫 Suspender
                  </button>
                  <button onClick={() => habilitarUsuario(usuario.uid)} className="tab-btn btn-enable-user">
                    ✅ Habilitar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminDashboard;