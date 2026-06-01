import React, { useState, useEffect } from 'react';
import ListaLibros from '../components/ListaLibros';
import { auth, actualizarDatosPerfil, cambiarContrasenaInterna } from '../services/authService';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

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
  const [mensajePerfil, setMensajePerfil] = useState('');
  const [mensajePassword, setMensajePassword] = useState('');
  
  const [verPasswordNueva, setVerPasswordNueva] = useState(false);
  const [verPasswordConfirmar, setVerPasswordConfirmar] = useState(false);

  useEffect(() => {
    const cargarDatosExtras = async () => {
      if (auth.currentUser && pestana === 'perfil') {
        const docRef = doc(db, "usuarios", auth.currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setPerfilData({
            nombre: docSnap.data().nombre || auth.currentUser.displayName || '',
            telefono: docSnap.data().telefono || ''
          });
        }
      }
    };
    cargarDatosExtras();
  }, [pestana]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.titulo.trim()) return alert("El título no puede estar vacío");
    if (parseFloat(formData.precio) <= 0) return alert("El precio debe ser mayor a 0");

    const nuevoLibro = {
      ...formData,
      precio: parseFloat(formData.precio),
      fecha_publicacion: new Date(),
      fotos: formData.fotos.length > 0 ? formData.fotos : ['https://via.placeholder.com/300x400?text=Sin+Portada']
    };

    await onCrear(nuevoLibro);
    
    setFormData({
      titulo: '',
      descripcion: '',
      precio: '',
      nivel: 'Nivel 1',
      estado: 'Nuevo',
      incluye_codigo: false,
      fotos: []
    });
    alert("¡Libro publicado con éxito!");
  };

  const handleUpdatePerfil = async (e) => {
    e.preventDefault();
    setMensajePerfil('');
    
    if (perfilData.nombre.trim().length < 3) {
      return setMensajePerfil("El nombre debe tener al menos 3 caracteres.");
    }
    if (!/^\d{10}$/.test(perfilData.telefono)) {
      return setMensajePerfil("El teléfono debe tener exactamente 10 dígitos numéricos.");
    }

    const { error } = await actualizarDatosPerfil(auth.currentUser.uid, perfilData.nombre, perfilData.telefono);
    if (error) setMensajePerfil("Error: " + error.message);
    else setMensajePerfil("✅ Perfil actualizado correctamente.");
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

    const { error } = await cambiarContrasenaInterna(passwordData.nueva);
    if (error) setMensajePassword("Error: " + error.message);
    else {
      setMensajePassword("✅ Contraseña cambiada con éxito.");
      setPasswordData({ nueva: '', confirmar: '' });
    }
  };

  return (
    <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      
      <div style={{ display: 'flex', gap: '10px', marginBottom: '1.5rem' }}>
        <button 
          onClick={() => setPestana('ventas')} 
          style={{ padding: '10px 20px', background: pestana === 'ventas' ? '#ffc107' : '#333', color: pestana === 'ventas' ? '#000' : '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          🛒 Panel de Ventas
        </button>
        <button 
          onClick={() => setPestana('perfil')} 
          style={{ padding: '10px 20px', background: pestana === 'perfil' ? '#ffc107' : '#333', color: pestana === 'perfil' ? '#000' : '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          👤 Mi Perfil
        </button>
      </div>

      {pestana === 'ventas' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem', alignItems: 'start' }}>
          
          <div style={{ background: '#1e1e1e', padding: '20px', borderRadius: '8px', color: '#fff' }}>
            <h2 style={{ marginBottom: '15px', fontSize: '1.2rem' }}>Publicar un Libro</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              
              <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                Título del Libro:
                <input 
                  type="text" 
                  name="titulo" 
                  value={formData.titulo} 
                  onChange={handleChange} 
                  required 
                  style={{ padding: '8px', borderRadius: '4px', border: '1px solid #444', background: '#333', color: '#fff' }}
                />
              </label>

              <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                Descripción:
                <textarea 
                  name="descripcion" 
                  value={formData.descripcion} 
                  onChange={handleChange} 
                  style={{ padding: '8px', borderRadius: '4px', border: '1px solid #444', background: '#333', color: '#fff', resize: 'vertical' }}
                />
              </label>

              <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                Precio ($):
                <input 
                  type="number" 
                  name="precio" 
                  step="0.01" 
                  value={formData.precio} 
                  onChange={handleChange} 
                  required 
                  style={{ padding: '8px', borderRadius: '4px', border: '1px solid #444', background: '#333', color: '#fff' }}
                />
              </label>

              <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                Nivel de Inglés:
                <select 
                  name="nivel" 
                  value={formData.nivel} 
                  onChange={handleChange}
                  style={{ padding: '8px', borderRadius: '4px', border: '1px solid #444', background: '#333', color: '#fff' }}
                >
                  <option value="Nivel 1">Nivel 1</option>
                  <option value="Nivel 2">Nivel 2</option>
                  <option value="Nivel 3">Nivel 3</option>
                  <option value="Nivel 4">Nivel 4</option>
                  <option value="Intensivo">Intensivo</option>
                </select>
              </label>

              <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                Estado del Libro:
                <select 
                  name="estado" 
                  value={formData.estado} 
                  onChange={handleChange}
                  style={{ padding: '8px', borderRadius: '4px', border: '1px solid #444', background: '#333', color: '#fff' }}
                >
                  <option value="Nuevo">Nuevo</option>
                  <option value="Buen estado">Buen estado</option>
                  <option value="Usado - Rayado">Usado - Rayado</option>
                  <option value="Desgastado">Desgastado</option>
                </select>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginTop: '5px' }}>
                <input 
                  type="checkbox" 
                  name="incluye_codigo" 
                  checked={formData.incluye_codigo} 
                  onChange={handleChange} 
                />
                ¿Incluye código digital accesible?
              </label>

              <button 
                type="submit" 
                style={{ padding: '10px', background: '#ffc107', color: '#000', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}
              >
                Publicar Libro
              </button>
            </form>
          </div>

          <div style={{ background: '#1e1e1e', padding: '20px', borderRadius: '8px', color: '#fff' }}>
            <h2 style={{ marginBottom: '15px', fontSize: '1.2rem' }}>Mis publicaciones e inventario</h2>
            <ListaLibros />
          </div>

        </div>
      )}

      {pestana === 'perfil' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }}>
          
          <div style={{ background: '#1e1e1e', padding: '20px', borderRadius: '8px', color: '#fff' }}>
            <h2 style={{ marginBottom: '5px', fontSize: '1.2rem' }}>Datos del Perfil</h2>
            <p style={{ color: '#aaa', fontSize: '0.85rem', marginBottom: '15px' }}>Mantén tu contacto actualizado para que te localicen en la Poli.</p>
            <form onSubmit={handleUpdatePerfil} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                Correo Electrónico (No editable):
                <input type="text" disabled value={auth.currentUser?.email || ''} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #444', background: '#222', color: '#888', cursor: 'not-allowed' }} />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                Nombre Completo:
                <input type="text" value={perfilData.nombre} onChange={(e) => setPerfilData({ ...perfilData, nombre: e.target.value })} required style={{ padding: '8px', borderRadius: '4px', border: '1px solid #444', background: '#333', color: '#fff' }} />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                Número de WhatsApp / Teléfono:
                <input type="tel" placeholder="099XXXXXXX" value={perfilData.telefono} onChange={(e) => setPerfilData({ ...perfilData, telefono: e.target.value })} required style={{ padding: '8px', borderRadius: '4px', border: '1px solid #444', background: '#333', color: '#fff' }} />
              </label>
              <button type="submit" style={{ padding: '10px', background: '#ffc107', color: '#000', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', marginTop: '5px' }}>
                Actualizar Datos
              </button>
              {mensajePerfil && <p style={{ marginTop: '10px', fontWeight: 'bold', fontSize: '0.9rem' }}>{mensajePerfil}</p>}
            </form>
          </div>

          <div style={{ background: '#1e1e1e', padding: '20px', borderRadius: '8px', color: '#fff' }}>
            <h2 style={{ marginBottom: '15px', fontSize: '1.2rem' }}>Seguridad y Contraseña</h2>
            <form onSubmit={handleUpdatePassword} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                Nueva Contraseña:
                <div style={{ display: 'flex', gap: '5px' }}>
                  <input 
                    type={verPasswordNueva ? "text" : "password"} 
                    placeholder="Mínimo 6 caracteres" 
                    value={passwordData.nueva} 
                    onChange={(e) => setPasswordData({ ...passwordData, nueva: e.target.value })} 
                    required 
                    style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #444', background: '#333', color: '#fff' }} 
                  />
                  <button type="button" onClick={() => setVerPasswordNueva(!verPasswordNueva)} style={{ padding: '8px', background: '#444', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    {verPasswordNueva ? "🙈" : "👁️"}
                  </button>
                </div>
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                Confirmar Nueva Contraseña:
                <div style={{ display: 'flex', gap: '5px' }}>
                  <input 
                    type={verPasswordConfirmar ? "text" : "password"} 
                    value={passwordData.confirmar} 
                    onChange={(e) => setPasswordData({ ...passwordData, confirmar: e.target.value })} 
                    required 
                    style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #444', background: '#333', color: '#fff' }} 
                  />
                  <button type="button" onClick={() => setVerPasswordConfirmar(!verPasswordConfirmar)} style={{ padding: '8px', background: '#444', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    {verPasswordConfirmar ? "🙈" : "👁️"}
                  </button>
                </div>
              </label>
              <button type="submit" style={{ padding: '10px', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', marginTop: '5px' }}>
                Cambiar Contraseña
              </button>
              {mensajePassword && <p style={{ marginTop: '10px', fontWeight: 'bold', fontSize: '0.9rem' }}>{mensajePassword}</p>}
            </form>
          </div>

        </div>
      )}
    </main>
  );
};

export default Dashboard;