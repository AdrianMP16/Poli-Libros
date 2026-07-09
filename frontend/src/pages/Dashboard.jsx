import React, { useState, useEffect } from 'react';
import ListaLibros from '../components/ListaLibros';
import { auth, actualizarDatosPerfil, cambiarContrasenaInterna } from '../services/authService';
import Sidebar from '../components/Sidebar';
import { API_URL } from '../services/config';
import '../styles/Dashboard.css';

const Dashboard = ({ libros, onCrear, onEliminar, onActualizar }) => {
  const [esAdmin, setEsAdmin] = useState(false);
  const [pestana, setPestana] = useState('ventas');
  const [sidebarAbierto, setSidebarAbierto] = useState(false);

  const [formData, setFormData] = useState({
    nivel: 'Begginer', descripcion: '', precio: '', incluye_codigo: false, estado_fisico: ''
  });
  const [perfilData, setPerfilData] = useState({ nombre: auth.currentUser?.displayName || '', telefono: '' });
  const [passwordData, setPasswordData] = useState({ nueva: '', confirmar: '' });
  const [misReportes, setMisReportes] = useState([]);

  const [mensajePerfil, setMensajePerfil] = useState('');
  const [mensajePassword, setMensajePassword] = useState('');

  const [verPasswordNueva, setVerPasswordNueva] = useState(false);
  const [verPasswordConfirmar, setVerPasswordConfirmar] = useState(false);

  const [imagen, setImagen] = useState(null);
  const [subiendo, setSubiendo] = useState(false);

  useEffect(() => {
    const cargarMisReportes = async () => {
      if (pestana === 'reportes' && auth.currentUser) {
        try {
          const token = await auth.currentUser.getIdToken();
          const res = await fetch(`${API_URL}/api/reportes/mis-reportes`, {
            headers: { "Authorization": `Bearer ${token}` }
          });

          if (res.ok) {
            const datos = await res.json();
            setMisReportes(datos);
          }
        } catch (error) {
          console.error("Error al cargar mis reportes:", error);
        }
      }
    };

    cargarMisReportes();
  }, [pestana]);

  useEffect(() => {
    const verificarRol = async () => {
      if (auth.currentUser) {
        const idTokenResult = await auth.currentUser.getIdTokenResult();
        if (idTokenResult.claims.admin) {
          setEsAdmin(true);
        }
      }
    };
    verificarRol();
  }, []);

  useEffect(() => {
    const cargarDatosExtras = async () => {
      if (auth.currentUser && pestana === 'perfil') {
        try {
          const token = await auth.currentUser.getIdToken();
          const res = await fetch(`${API_URL}/api/usuarios/${auth.currentUser.uid}`, {
            headers: { "Authorization": `Bearer ${token}` }
          });

          if (res.ok) {
            const datos = await res.json();
            setPerfilData({
              nombre: auth.currentUser.displayName || '',
              telefono: datos.telefono || ''
            });
          }
        } catch (error) {
          console.error("Error al cargar datos extras del backend:", error);
        }
      }
    };
    cargarDatosExtras();
  }, [pestana]);

  useEffect(() => {
    const cargarNotificaciones = async () => {
      if (pestana === 'notificaciones' && auth.currentUser) {
        try {
          const token = await auth.currentUser.getIdToken();
          const res = await fetch(`${API_URL}/api/reportes/notificaciones`, {
            headers: { "Authorization": `Bearer ${token}` }
          });

          if (res.ok) {
            const datos = await res.json();
            setMisReportes(datos);
          }
        } catch (error) {
          console.error("Error al cargar notificaciones:", error);
        }
      }
    };
    cargarNotificaciones();
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

  const handleUpdatePerfil = async (e) => {
    e.preventDefault();
    setMensajePerfil('');
    if (perfilData.nombre.trim().length < 3) {
      return setMensajePerfil("El nombre debe tener al menos 3 caracteres.");
    }
    if (!/^\d{10}$/.test(perfilData.telefono)) {
      return setMensajePerfil("El teléfono debe tener 10 dígitos numéricos.");
    }

    try {
      await actualizarDatosPerfil(auth.currentUser.uid, perfilData.nombre, perfilData.telefono);
      setMensajePerfil("✅ Perfil actualizado correctamente.");
    } catch (error) {
      setMensajePerfil("Error: " + error.message);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setMensajePassword('');
    if (passwordData.nueva.length < 6) {
      return setMensajePassword("La contraseña debe tener al menos 6 caracteres.");
    }
    if (passwordData.nueva !== passwordData.confirmar) {
      return setMensajePassword("Las contraseñas no coinciden.");
    }

    try {
      await cambiarContrasenaInterna(passwordData.nueva);
      setMensajePassword("✅ Contraseña cambiada con éxito.");
      setPasswordData({ nueva: '', confirmar: '' });
    } catch (error) {
      setMensajePassword("Error: " + error.message);
    }
  };

  return (
    <div className="dashboard-wrapper">
      
      {/* Componente Sidebar */}
      <Sidebar user={auth.currentUser} esAdmin={esAdmin} isOpen={sidebarAbierto} onClose={() => setSidebarAbierto(false)} />

      {/* Contenedor dinámico principal */}
      <div className={`dashboard-main-content ${sidebarAbierto ? 'sidebar-open' : 'sidebar-closed'}`}>
        
        {/* ENLACE PARA REGRESAR A LA LANDING PAGE */}
        <div className="back-link-container">
          <a href="/" className="btn-back-landing">
            ← Volver al Inicio (PoliLibros)
          </a>
        </div>

        {/* BOTÓN CONTROLADOR DEL MENÚ */}
        <button onClick={() => setSidebarAbierto(!sidebarAbierto)} className="btn-menu-toggle">
          {sidebarAbierto ? '✕ Cerrar Menú' : '☰ Abrir Menú'}
        </button>

        <div className="dashboard-inner-container">
          <h2 className="dashboard-title">Panel de Control</h2>
          <p className="dashboard-welcome">Bienvenido, {auth.currentUser?.displayName || auth.currentUser?.email}</p>

          {/* MENÚ DE PESTAÑAS */}
          <div className="dashboard-tabs-nav">
            <button 
              onClick={() => setPestana('ventas')}
              className={`dashboard-tab-btn ${pestana === 'ventas' ? 'active-tab' : 'inactive-tab'}`}
            >
              Mis Publicaciones
            </button>
            <button 
              onClick={() => setPestana('perfil')}
              className={`dashboard-tab-btn ${pestana === 'perfil' ? 'active-tab' : 'inactive-tab'}`}
            >
              Mi Perfil
            </button>
          </div>

          {/* CONTENIDO DE PESTAÑAS */}
          {pestana === 'ventas' && (
            <div>
              <h3 className="section-subtitle yellow-border">Publicar un Nuevo Libro</h3>

              <form onSubmit={handleSubmitLibro} className="dashboard-form-card light-theme">
                <div className="form-grid-two-cols">
                  <label className="form-field-label text-dark">
                    Precio ($) *
                    <input 
                      type="number" 
                      step="0.01" 
                      value={formData.precio} 
                      onChange={(e) => setFormData({ ...formData, precio: e.target.value })} 
                      required 
                      className="form-input-text font-normal" 
                      placeholder="Ej: 15.50" 
                    />
                  </label>
                </div>

                <label className="form-field-label text-dark">
                  Descripción
                  <textarea 
                    value={formData.descripcion} 
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })} 
                    className="form-textarea font-normal" 
                    placeholder="Detalla si tiene rayones, páginas dobladas, etc." 
                  />
                </label>

                <div className="form-responsive-grid">
                  <label className="form-field-label text-dark">
                    Nivel
                    <select 
                      value={formData.nivel} 
                      onChange={(e) => setFormData({ ...formData, nivel: e.target.value })} 
                      className="form-select font-normal"
                    >
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

                  <label className="form-field-label text-dark">
                    Estado
                    <select 
                      value={formData.estado_fisico} 
                      onChange={(e) => setFormData({ ...formData, estado_fisico: e.target.value })} 
                      className="form-select font-normal"
                    >
                      <option value="Usado">Con marcas de esfero o sellos</option>
                      <option value="Usado 2">Con apuntes en lápiz</option>
                    </select>
                  </label>

                  <label className="form-field-label text-dark">
                    Foto del Libro *
                    <input
                      id="file-input-libro"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setImagen(e.target.files[0])}
                      required
                      className="form-input-file font-normal"
                    />
                  </label>

                  <label className="form-checkbox-label text-dark">
                    <input 
                      type="checkbox" 
                      checked={formData.incluye_codigo} 
                      onChange={(e) => setFormData({ ...formData, incluye_codigo: e.target.checked })} 
                      className="form-checkbox-input" 
                    />
                    Incluye código web
                  </label>
                </div>

                <button type="submit" disabled={subiendo} className="btn-submit-publish">
                  {subiendo ? 'Publicando...' : 'Publicar Libro'}
                </button>
              </form>

              <h3 className="section-subtitle yellow-border mt-2rem">Mis Libros Publicados</h3>
              <ListaLibros
                libros={libros.filter(l => l.vendedor_id === auth.currentUser?.uid)}
                onEliminar={onEliminar}
                onActualizar={onActualizar}
                subiendo={subiendo}
              />
            </div>
          )}

          {pestana === 'perfil' && (
            <div className="profile-grid-container">
              {/* Información de Contacto */}
              <div className="profile-card light-theme border-light">
                <h3 className="profile-card-title dark-text">Información de Contacto</h3>
                <form onSubmit={handleUpdatePerfil} className="profile-form">
                  <label className="profile-field-label">
                    Nombre Completo:
                    <input 
                      type="text" 
                      value={perfilData.nombre} 
                      onChange={(e) => setPerfilData({ ...perfilData, nombre: e.target.value })} 
                      required 
                      className="profile-input-text" 
                    />
                  </label>
                  <label className="profile-field-label">
                    WhatsApp / Teléfono:
                    <input 
                      type="tel" 
                      placeholder="09XXXXXXXX" 
                      value={perfilData.telefono} 
                      onChange={(e) => setPerfilData({ ...perfilData, telefono: e.target.value })} 
                      required 
                      className="profile-input-text" 
                    />
                  </label>
                  <button type="submit" className="btn-profile-save">Guardar Cambios</button>
                  {mensajePerfil && <p className="profile-status-message">{mensajePerfil}</p>}
                </form>
              </div>

              {/* Seguridad de la Cuenta */}
              <div className="profile-card dark-theme">
                <h3 className="profile-card-title teal-text">Seguridad de la Cuenta</h3>
                <form onSubmit={handleUpdatePassword} className="profile-form">
                  <label className="profile-field-label">
                    Nueva Contraseña:
                    <div className="password-input-group">
                      <input 
                        type={verPasswordNueva ? "text" : "password"} 
                        value={passwordData.nueva} 
                        onChange={(e) => setPasswordData({ ...passwordData, nueva: e.target.value })} 
                        required 
                        className="profile-input-dark" 
                      />
                      <button type="button" onClick={() => setVerPasswordNueva(!verPasswordNueva)} className="btn-toggle-pwd">
                        {verPasswordNueva ? "🙈" : "👁️"}
                      </button>
                    </div>
                  </label>
                  <label className="profile-field-label">
                    Confirmar Nueva Contraseña:
                    <div className="password-input-group">
                      <input 
                        type={verPasswordConfirmar ? "text" : "password"} 
                        value={passwordData.confirmar} 
                        onChange={(e) => setPasswordData({ ...passwordData, confirmar: e.target.value })} 
                        required 
                        className="profile-input-dark" 
                      />
                      <button type="button" onClick={() => setVerPasswordConfirmar(!verPasswordConfirmar)} className="btn-toggle-pwd">
                        {verPasswordConfirmar ? "🙈" : "👁️"}
                      </button>
                    </div>
                  </label>
                  <button type="submit" className="btn-profile-danger">Cambiar Contraseña</button>
                  {mensajePassword && <p className="profile-status-message">{mensajePassword}</p>}
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;