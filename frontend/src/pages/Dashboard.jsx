import React, { useState, useEffect } from 'react';
import ListaLibros from '../components/ListaLibros';
import { auth, actualizarDatosPerfil, cambiarContrasenaInterna } from '../services/authService';
import { getFirestore, doc, getDoc, collection, query, where, onSnapshot } from 'firebase/firestore';

const Dashboard = ({ libros, onCrear, onEliminar, onActualizar }) => {
  const [pestana, setPestana] = useState('ventas');
  const db = getFirestore();


  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    precio: '',
    nivel: 'Nivel 1',
    estado: 'Nuevo',
    incluye_codigo: false,
    fotos: []
  });

  const [perfilData, setPerfilData] = useState({ nombre: auth.currentUser?.displayName || '', telefono: '' });
  const [passwordData, setPasswordData] = useState({ nueva: '', confirmar: '' });
  const [misReportes, setMisReportes] = useState([]);


  const [mensajePerfil, setMensajePerfil] = useState('');
  const [mensajePassword, setMensajePassword] = useState('');

  const [verPasswordNueva, setVerPasswordNueva] = useState(false);
  const [verPasswordConfirmar, setVerPasswordConfirmar] = useState(false);

  useEffect(() => {
    const cargarDatosExtras = async () => {
      if (auth.currentUser && pestana === 'perfil') {
        try {
          const docRef = doc(db, "usuarios", auth.currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setPerfilData({
              nombre: auth.currentUser.displayName || '',
              telefono: docSnap.data().telefono || ''
            });
          }
        } catch (error) {
          console.error("Error al cargar datos extras de Firestore:", error);
        }
      }
    };
    cargarDatosExtras();
  }, [pestana, db]);

  useEffect(() => {
    if (pestana === 'notificaciones' && auth.currentUser) {
      const q = query(
        collection(db, "reports"),
        where("reportedBy", "==", auth.currentUser.uid),
        where("status", "==", "resolved_ban")
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setMisReportes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });
      return () => unsubscribe();
    }
  }, [pestana, db]);

  const handleSubmitLibro = (e) => {
    e.preventDefault();
    if (!formData.titulo || !formData.precio) return alert("Título y precio obligatorios");
    onCrear({
      ...formData,
      precio: Number(formData.precio),
      vendedor_id: auth.currentUser?.uid,
      fecha_publicacion: new Date().toISOString()
    });
    setFormData({ titulo: '', descripcion: '', precio: '', nivel: 'Nivel 1', estado: 'Nuevo', incluye_codigo: false, fotos: [] });
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
    <div style={{ maxWidth: '1000px', margin: '2rem auto', padding: '0 1rem', fontFamily: 'sans-serif' }}>
      <h2 style={{ color: '#0f2027' }}>Panel de Control</h2>
      <p style={{ color: '#666' }}>Bienvenido, {auth.currentUser?.displayName || auth.currentUser?.email}</p>

      {/* MENÚ DE PESTAÑAS */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '2px solid #ccc', paddingBottom: '10px' }}>
        <button onClick={() => setPestana('ventas')} style={{ padding: '10px', background: pestana === 'ventas' ? '#0f2027' : '#eee', color: pestana === 'ventas' ? '#fff' : '#333', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Mis Publicaciones</button>
        <button onClick={() => setPestana('perfil')} style={{ padding: '10px', background: pestana === 'perfil' ? '#0f2027' : '#eee', color: pestana === 'perfil' ? '#fff' : '#333', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Mi Perfil</button>
      </div>

      {/* CONTENIDO DE PESTAÑAS */}
      {pestana === 'ventas' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
          <div>
            <h3 style={{ color: '#0f2027', marginTop: 0 }}>Publicar un Libro</h3>
            <form onSubmit={handleSubmitLibro} style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: '#f9f9f9', padding: '1.5rem', borderRadius: '8px', border: '1px solid #eee' }}>
              <input type="text" placeholder="Título del libro" value={formData.titulo} onChange={(e) => setFormData({ ...formData, titulo: e.target.value })} required style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
              <textarea placeholder="Descripción (estado, edición, etc.)" value={formData.descripcion} onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', minHeight: '80px' }} />
              <input type="number" step="0.01" placeholder="Precio ($)" value={formData.precio} onChange={(e) => setFormData({ ...formData, precio: e.target.value })} required style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />

              <select value={formData.nivel} onChange={(e) => setFormData({ ...formData, nivel: e.target.value })} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}>
                <option value="Nivel 1">Nivel 1 (Primeros Semestres)</option>
                <option value="Nivel 2">Nivel 2 (Semestres Medios)</option>
                <option value="Nivel 3">Nivel 3 (Semestres Avanzados)</option>
              </select>

              <select value={formData.estado} onChange={(e) => setFormData({ ...formData, estado: e.target.value })} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}>
                <option value="Nuevo">Nuevo</option>
                <option value="Como nuevo">Como nuevo</option>
                <option value="Buen estado">Buen estado</option>
                <option value="Usado">Usado / Rayado</option>
              </select>

              <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.9rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={formData.incluye_codigo} onChange={(e) => setFormData({ ...formData, incluye_codigo: e.target.checked })} />
                ¿Incluye código de acceso digital vigente?
              </label>

              <button type="submit" style={{ padding: '10px', background: '#0f2027', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>Subir Publicación</button>
            </form>
          </div>

          <div>
            <h3 style={{ color: '#0f2027', marginTop: 0 }}>Tus Libros Activos</h3>
            <ListaLibros libros={libros.filter(l => l.vendedor_id === auth.currentUser?.uid)} onEliminar={onEliminar} onActualizar={onActualizar} />
          </div>
        </div>
      )}

      {pestana === 'perfil' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div style={{ background: '#f9f9f9', padding: '1.5rem', borderRadius: '8px', border: '1px solid #eee' }}>
            <h3 style={{ marginTop: 0, color: '#0f2027' }}>Información de Contacto</h3>
            <form onSubmit={handleUpdatePerfil} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                Nombre Completo:
                <input type="text" value={perfilData.nombre} onChange={(e) => setPerfilData({ ...perfilData, nombre: e.target.value })} required style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                WhatsApp / Teléfono:
                <input type="tel" placeholder="09XXXXXXXX" value={perfilData.telefono} onChange={(e) => setPerfilData({ ...perfilData, telefono: e.target.value })} required style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
              </label>
              <button type="submit" style={{ padding: '10px', background: '#16a085', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', marginTop: '5px' }}>Guardar Cambios</button>
              {mensajePerfil && <p style={{ marginTop: '10px', fontWeight: 'bold', fontSize: '0.9rem' }}>{mensajePerfil}</p>}
            </form>
          </div>

          <div style={{ background: '#222', color: '#fff', padding: '1.5rem', borderRadius: '8px' }}>
            <h3 style={{ marginTop: 0, color: '#16a085' }}>Seguridad de la Cuenta</h3>
            <form onSubmit={handleUpdatePassword} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                Nueva Contraseña:
                <div style={{ display: 'flex', gap: '5px' }}>
                  <input type={verPasswordNueva ? "text" : "password"} value={passwordData.nueva} onChange={(e) => setPasswordData({ ...passwordData, nueva: e.target.value })} required style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #444', background: '#333', color: '#fff' }} />
                  <button type="button" onClick={() => setVerPasswordNueva(!verPasswordNueva)} style={{ padding: '8px', background: '#444', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>{verPasswordNueva ? "🙈" : "👁️"}</button>
                </div>
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                Confirmar Nueva Contraseña:
                <div style={{ display: 'flex', gap: '5px' }}>
                  <input type={verPasswordConfirmar ? "text" : "password"} value={passwordData.confirmar} onChange={(e) => setPasswordData({ ...passwordData, confirmar: e.target.value })} required style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #444', background: '#333', color: '#fff' }} />
                  <button type="button" onClick={() => setVerPasswordConfirmar(!verPasswordConfirmar)} style={{ padding: '8px', background: '#444', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>{verPasswordConfirmar ? "🙈" : "👁️"}</button>
                </div>
              </label>
              <button type="submit" style={{ padding: '10px', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', marginTop: '5px' }}>Cambiar Contraseña</button>
              {mensajePassword && <p style={{ marginTop: '10px', fontWeight: 'bold', fontSize: '0.9rem' }}>{mensajePassword}</p>}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;