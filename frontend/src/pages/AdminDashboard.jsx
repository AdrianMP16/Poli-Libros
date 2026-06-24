import React, { useState, useEffect } from 'react';
import { auth } from '../services/authService';
import Sidebar from '../components/Sidebar';
import ListaLibros from '../components/ListaLibros';
import { API_URL } from '../services/config';

// Agregamos las props que ahora mandamos desde App.jsx
const AdminDashboard = ({ libros, onCrear, onEliminar, onActualizar }) => {
  const [pestana, setPestana] = useState('reportes');
  const [sidebarAbierto, setSidebarAbierto] = useState(false);

  const [reportes, setReportes] = useState([]);
  const [usuarios, setUsuarios] = useState([]);

  const [anuncios, setAnuncios] = useState([]); 
  const [cargando, setCargando] = useState(false);

  const [libroFiltro, setLibroFiltro] = useState(null);

  // Estados para publicar un libro
  const [formData, setFormData] = useState({
    nivel: 'Begginer', descripcion: '', precio: '', incluye_codigo: false, estado_fisico: ''
  });

  // NUEVO: Estados para los anuncios
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
        // Lo quitamos de la pantalla actualizando el estado local
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
        alert(data.mensaje); // Muestra cuántos strikes lleva o si fue baneado
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
            const datos = await res.json();
            setReportes(datos);
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

  // Manejo de libros usando las props de App.jsx
  const handleSubmitLibro = async (e) => {
    e.preventDefault();
    if (!formData.nivel || !formData.precio) return alert("Nivel y precio obligatorios");
    if (!imagen) return alert("Por favor, sube una foto del libro.");

    setSubiendo(true);

    const formDataToSend = new FormData();
    formDataToSend.append("nivel", formData.nivel); // El nivel ahora es el "título"
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

  // NUEVO: Función para enviar el anuncio al Backend
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
        cargarAnuncios(); // 👈 Refrescamos la lista para ver el nuevo anuncio
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
    <div style={{ maxWidth: '1000px', margin: '2rem auto', padding: '0 1rem' }}>
      <Sidebar user={auth.currentUser} esAdmin={true} isOpen={sidebarAbierto} onClose={() => setSidebarAbierto(false)} />

      <div style={{ maxWidth: '1000px', margin: '2rem auto', padding: '0 1rem', fontFamily: 'sans-serif' }}>
        <button onClick={() => setSidebarAbierto(true)} style={{ background: '#0f2027', color: '#fff', border: 'none', padding: '10px 15px', borderRadius: '4px', cursor: 'pointer', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
          ☰ Abrir Menú
        </button>
        <h2>Panel de Administración Global</h2>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <button onClick={() => setPestana('reportes')} style={{ padding: '10px', background: pestana === 'reportes' ? '#0f2027' : '#eee', color: pestana === 'reportes' ? '#fff' : '#333', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>🚨 Reportes</button>
          <button onClick={() => setPestana('usuarios')} style={{ padding: '10px', background: pestana === 'usuarios' ? '#0f2027' : '#eee', color: pestana === 'usuarios' ? '#fff' : '#333', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>⚙️ Control de Usuarios</button>
          <button onClick={() => setPestana('libros_global')} style={{ padding: '10px', background: pestana === 'libros_global' ? '#0f2027' : '#eee', color: pestana === 'libros_global' ? '#fff' : '#333', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>📚 Gestión de Libros</button>
          <button onClick={() => setPestana('anuncios')} style={{ padding: '10px', background: pestana === 'anuncios' ? '#16a085' : '#eee', color: pestana === 'anuncios' ? '#fff' : '#333', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>📢 Publicar Anuncios</button>
        </div>

        {cargando && <p>Cargando información del servidor...</p>}

        {/* Pestaña: Anuncios */}
        {pestana === 'anuncios' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            
            {/* Formulario de creación */}
            <div style={{ background: '#f9f9f9', padding: '2rem', borderRadius: '8px', border: '1px solid #eee' }}>
              <h3 style={{ marginTop: 0, color: '#0f2027' }}>Publicar un Anuncio</h3>
              <form onSubmit={handleCrearAnuncio} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <input type="text" placeholder="Título del anuncio" value={anuncioData.titulo} onChange={(e) => setAnuncioData({ ...anuncioData, titulo: e.target.value })} required style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
                <textarea placeholder="Contenido del mensaje..." value={anuncioData.mensaje} onChange={(e) => setAnuncioData({ ...anuncioData, mensaje: e.target.value })} required style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc', minHeight: '100px' }} />
                <button type="submit" style={{ padding: '12px', background: '#16a085', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>Publicar Anuncio</button>
                {mensajeAnuncio && <p style={{ fontWeight: 'bold' }}>{mensajeAnuncio}</p>}
              </form>
            </div>

            {/* NUEVO: Lista de anuncios activos */}
            <div>
              <h3 style={{ marginTop: 0, color: '#0f2027' }}>Anuncios Activos</h3>
              {anuncios.length === 0 ? (
                <p>No hay anuncios publicados.</p>
              ) : (
                anuncios.map(anuncio => (
                  <div key={anuncio.id} style={{ background: '#fff', padding: '15px', borderRadius: '8px', border: '1px solid #ccc', marginBottom: '10px' }}>
                    <h4 style={{ margin: '0 0 5px 0' }}>{anuncio.titulo}</h4>
                    <p style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: '#555' }}>{anuncio.mensaje}</p>
                    <button 
                      onClick={() => handleEliminarAnuncio(anuncio.id)}
                      style={{ background: '#e74c3c', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
                    >
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
            {/* PANEL DE MODERACIÓN RÁPIDA (Solo aparece si vienes de un reporte) */}
            {libroFiltro && (
              <div style={{ background: '#ffeaa7', padding: '20px', borderRadius: '8px', marginBottom: '20px', border: '2px solid #e1b12c' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ color: '#d35400', margin: 0 }}>🚨 Modo de Moderación Activo</h3>
                  <button onClick={() => setLibroFiltro(null)} style={{ background: 'transparent', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>✖ Cerrar Filtro</button>
                </div>

                {(() => {
                  // Buscamos el libro específico en tu arreglo de libros
                  const libroEnCuestion = libros.find(l => l.id === libroFiltro || l.id_firestore === libroFiltro);

                  if (libroEnCuestion) {
                    return (
                      <div style={{ marginTop: '15px' }}>
                        <p><strong>Título:</strong> {libroEnCuestion.titulo}</p>
                        <p><strong>ID Vendedor:</strong> {libroEnCuestion.vendedor_id}</p>

                        <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                          <button
                            onClick={() => onEliminar(libroEnCuestion.id || libroEnCuestion.id_firestore)}
                            style={{ padding: '10px', background: '#e74c3c', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                            🗑️ Borrar Publicación
                          </button>
                          <button
                            onClick={() => handleAplicarStrike(libroEnCuestion.vendedor_id)}
                            style={{ padding: '10px', background: '#c0392b', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                            ⚠️ Enviar 1 Strike al Usuario
                          </button>
                        </div>
                      </div>
                    );
                  } else {
                    return <p style={{ marginTop: '15px', fontWeight: 'bold' }}>El libro ya no existe o fue eliminado.</p>;
                  }
                })()}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
              {/* Tu formulario de crear libro de admin se queda igual */}
              <div>
                <h3 style={{ color: '#0f2027', marginTop: 0 }}>Publicar un Libro (Admin)</h3>
                <form onSubmit={handleSubmitLibro} style={{ display: 'flex', flexDirection: 'column', gap: '15px', background: '#fff', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', marginBottom: '2rem' }}>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>

                    <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontWeight: 'bold', color: '#333' }}>
                      Precio ($) *
                      <input type="number" step="0.01" value={formData.precio} onChange={(e) => setFormData({ ...formData, precio: e.target.value })} required style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc', fontWeight: 'normal' }} placeholder="Ej: 15.50" />
                    </label>
                  </div>

                  <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontWeight: 'bold', color: '#333' }}>
                    Descripción
                    <textarea value={formData.descripcion} onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc', minHeight: '80px', fontWeight: 'normal', fontFamily: 'inherit' }} placeholder="Detalla si tiene rayones, páginas dobladas, etc." />
                  </label>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', alignItems: 'center' }}>
                    <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontWeight: 'bold', color: '#333' }}>
                      Nivel
                      <select value={formData.nivel} onChange={(e) => setFormData({ ...formData, nivel: e.target.value })} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc', fontWeight: 'normal' }}>
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

                    <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontWeight: 'bold', color: '#333' }}>
                      Estado
                      <select value={formData.estado_fisico} onChange={(e) => setFormData({ ...formData, estado_fisico: e.target.value })} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc', fontWeight: 'normal' }}>
                        <option value="Usado">Con marcas de esfero o sellos</option>
                        <option value="Usado 2">Con apuntes en lápiz</option>
                      </select>
                    </label>

                    <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontWeight: 'bold', color: '#333' }}>
                      Foto del Libro *
                      <input
                        id="file-input-libro"
                        type="file"
                        accept="image/*"
                        onChange={(e) => setImagen(e.target.files[0])}
                        required
                        style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc', fontWeight: 'normal' }}
                      />
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 'bold', cursor: 'pointer', marginTop: '20px', color: '#333' }}>
                      <input type="checkbox" checked={formData.incluye_codigo} onChange={(e) => setFormData({ ...formData, incluye_codigo: e.target.checked })} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
                      Incluye código web
                    </label>
                  </div>

                  <button type="submit" style={{ padding: '12px', background: '#f1c40f', color: '#0f2027', border: 'none', borderRadius: '4px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', marginTop: '10px', transition: 'background 0.3s' }}>
                    Publicar Libro
                  </button>
                </form>

                <h3 style={{ borderBottom: '2px solid #0f2027', paddingBottom: '10px', marginTop: '2rem', color: '#0f2027' }}>Mis Libros Publicados</h3>
              </div>

              <div>
                <h3 style={{ color: '#0f2027', marginTop: 0 }}>Catálogo Global</h3>
                {/* Si hay un filtro activo, solo mostramos ese libro. Si no, mostramos todos */}
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
                <div key={rep.id} style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '10px', borderRadius: '6px', background: '#fff' }}>
                  <p><strong>Libro Reportado:</strong> {rep.bookTitle}</p>
                  <p><strong>Motivo del Reporte:</strong> {rep.reason}</p>
                  <p><small>ID del Infractor: {rep.reportedUser}</small></p>

                  {/* NUEVOS BOTONES DEL REPORTE */}
                  <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <button
                      onClick={() => irAGestionDeLibro(rep.bookId)}
                      style={{ padding: '8px 12px', background: '#0f2027', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                      🔍 Ver Publicación
                    </button>
                    <button
                      onClick={() => handleInvalidarReporte(rep.id)}
                      style={{ padding: '8px 12px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
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
          <div style={{ background: '#222', color: '#fff', padding: '2rem', borderRadius: '8px' }}>
            <h3>Control de Usuarios (API)</h3>
            {usuarios.map(usuario => (
              <div key={usuario.uid} style={{ border: '1px solid #444', padding: '1rem', marginBottom: '1rem' }}>
                <h4>{usuario.nombre || usuario.displayName}</h4>
                <p>{usuario.email}</p>
                <button onClick={() => suspenderUsuario(usuario.uid)}>Suspender</button>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};
export default AdminDashboard;