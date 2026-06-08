import React, { useState, useEffect } from 'react';
import { auth } from '../services/authService';
import Sidebar from '../components/Sidebar';

const cargarUsuarios = async () => {

  if (!auth.currentUser) return;

  try {

    const token =
      await auth.currentUser.getIdToken();

    const res = await fetch(
      "http://127.0.0.1:3000/api/usuarios",
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    if (res.ok) {

      const datos = await res.json();

      setUsuarios(datos);

    }

  } catch(error) {

    console.error(error);

  }

};

const AdminDashboard = () => {
  const [pestana, setPestana] = useState('reportes');
  const [sidebarAbierto, setSidebarAbierto] = useState(false);

  const [reportes, setReportes] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(false);

  const suspenderUsuario = async (uid) => {

    const token = await auth.currentUser.getIdToken();

    await fetch(
      `http://127.0.0.1:3000/api/usuarios/${uid}/deshabilitar`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    cargarUsuarios();
  };

  // Cargar Reportes Pendientes desde Express
  useEffect(() => {
    const cargarReportes = async () => {
      if (pestana === 'reportes' && auth.currentUser) {
        setCargando(true);
        try {
          const token = await auth.currentUser.getIdToken();
          const res = await fetch("http://127.0.0.1:3000/api/reportes/pendientes", {
            headers: { "Authorization": `Bearer ${token}` }
          });

          if (res.ok) {
            const datos = await res.json();
            setReportes(datos);
          } else {
            console.error("Error al validar permisos de administrador en el backend.");
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

  // Cargar Usuarios desde Express (Se queda igual a como lo tenías planeado)
  useEffect(() => {
    const cargarUsuarios = async () => {
      if (pestana === 'usuarios' && auth.currentUser) {
        try {
          const token = await auth.currentUser.getIdToken();
          const res = await fetch("http://127.0.0.1:3000/api/usuarios", {
            headers: { "Authorization": `Bearer ${token}` }
          });
          if (res.ok) setUsuarios(await res.json());
        } catch (error) {
          console.error("Error al cargar usuarios:", error);
        }
      }
    };
    cargarUsuarios();
  }, [pestana]);

  // Las funciones handleVerHistorial y handlePenalizar las migraremos a rutas específicas de Express 
  // cuando vayas expandiendo el backend. Por ahora, este cambio estabiliza tu lectura.

  return (
    <div style={{ maxWidth: '1000px', margin: '2rem auto', padding: '0 1rem' }}>
      <Sidebar user={auth.currentUser} esAdmin={true} isOpen={sidebarAbierto} onClose={() => setSidebarAbierto(false)} />

      <div style={{ maxWidth: '1000px', margin: '2rem auto', padding: '0 1rem', fontFamily: 'sans-serif' }}>
        <button
          onClick={() => setSidebarAbierto(true)}
          style={{
            background: '#0f2027',
            color: '#fff',
            border: 'none',
            padding: '10px 15px',
            borderRadius: '4px',
            cursor: 'pointer',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: 'bold'
          }}
        >
          ☰ Abrir Menú
        </button>
        <h2>Panel de Administración Global</h2>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button onClick={() => setPestana('reportes')}>🚨 Reportes</button>
          <button onClick={() => setPestana('usuarios')}>⚙️ Control de Usuarios</button>
        </div>

        {cargando && <p>Cargando información del servidor...</p>}

        {!cargando && pestana === 'reportes' && (
          <div>
            <h3>Bandeja de Reportes Pendientes</h3>
            {reportes.length === 0 ? (
              <p>No hay reportes que revisar por el momento. ¡Buen trabajo!</p>
            ) : (
              reportes.map(rep => (
                <div key={rep.id} style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '10px', borderRadius: '6px' }}>
                  <p><strong>Libro Reportado:</strong> {rep.bookTitle}</p>
                  <p><strong>Motivo del Reporte:</strong> {rep.reason}</p>
                  <p><small>ID del Infractor: {rep.reportedUser}</small></p>
                </div>
              ))
            )}
          </div>
        )}

        {pestana === 'usuarios' && (
          <div style={{ background: '#222', color: '#fff', padding: '2rem', borderRadius: '8px' }}>
            <h3>Control de Usuarios (API)</h3>
            <p>Lista de control de acceso sincronizada con Firebase Admin.</p>
            {usuarios.map(usuario => (
              <div key={usuario.uid}
                style={{
                  border: '1px solid #444',
                  padding: '1rem',
                  marginBottom: '1rem'
              }}
              >
                <h4>{usuario.nombre}</h4>

                <p>{usuario.email}</p>

                <button
                  onClick={() => eliminarUsuario(usuario.uid)}
                >
                  Eliminar
                </button>
                <button
                  onClick={() => suspenderUsuario(usuario.uid)}
                >
                  Suspender
                </button>
              </div>
            ))}
              </div>
        )}
          </div>
    </div>
      );
};
      export default AdminDashboard;