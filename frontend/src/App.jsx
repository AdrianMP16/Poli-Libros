import { Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { auth } from './services/authService';
import { onAuthStateChanged, signOut } from 'firebase/auth';

import Login from './pages/Login.jsx';
import Landing from './pages/Landing.jsx';
import Dashboard from './pages/Dashboard.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';

function App() {
  const [user, setUser] = useState(null);
  const [esAdmin, setEsAdmin] = useState(false);
  const [libros, setLibros] = useState([]);
  const [cargando, setCargando] = useState(true);

  // 1. GESTIÓN DE SESIÓN (ESTRICTAMENTE SINCRONIZADA)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {

      if (firebaseUser) {
        try {
          await firebaseUser.getIdToken(true);

          const tokenResult = await firebaseUser.getIdTokenResult(true);

          console.log("UID:", firebaseUser.uid);
          console.log("Claims:", tokenResult.claims);

          setUser(firebaseUser);
          setEsAdmin(tokenResult.claims.role === "admin");

        } catch (error) {
          console.error("Error al verificar los claims:", error);
          setUser(null);
          setEsAdmin(false);
        }
      } else {
        setUser(null);
        setEsAdmin(false);
      }

      // SOLO CUANDO TODO ESTÁ LISTO, quitamos la pantalla de carga
      setCargando(false);
    });

    return () => unsubscribe();
  }, []);

  // 2. CARGAR LIBROS DEL BACKEND (Una sola vez)
  useEffect(() => {
    const cargarLibrosDelBackend = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/libros");
        if (res.ok) {
          const datos = await res.json();
          setLibros(datos);
        }
      } catch (error) {
        console.error("Error al traer los libros:", error);
      }
    };
    cargarLibrosDelBackend();
  }, []);

  // 3. PANTALLA DE CARGA BLINDADA
  if (cargando) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#111', color: 'white' }}>
        <h2>Cargando Polilibros... Verificando accesos.</h2>
      </div>
    );
  }

  // 4. FUNCIÓN DE EMERGENCIA PARA SALIR
  const handleCerrarSesion = async () => {
    await signOut(auth);
    localStorage.clear();
    window.location.href = '/'; // Forzamos recarga de la página limpia
  };

  if (cargando) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#1a1a1a',
        color: '#fff',
        fontFamily: 'sans-serif'
      }}>
        <h3>Cargando sesión...</h3>
      </div>
    );
  }

  return (
    <div className="App">

      {/* BOTÓN FLOTANTE DE EMERGENCIA: Siempre visible si estás logueado */}
      {user && (
        <button
          onClick={handleCerrarSesion}
          style={{
            position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999,
            backgroundColor: '#dc3545', color: 'white', padding: '15px 20px',
            borderRadius: '50px', fontWeight: 'bold', border: 'none', cursor: 'pointer',
            boxShadow: '0px 4px 10px rgba(0,0,0,0.5)'
          }}
        >
          🚪 SALIR DE EMERGENCIA
        </button>
      )}

      <Routes>
        {/* Rutas Públicas */}
        <Route path="/" element={<Landing libros={libros || []} user={user} />} />

        <Route
          path="/login"
          element={!user ? <Login /> : (esAdmin ? <Navigate to="/admin" /> : <Navigate to="/dashboard" />)}
        />

        {/* Dashboard de Usuario Común */}
        <Route
          path="/dashboard"
          element={
            user && !esAdmin ? (
              <Dashboard libros={libros || []} user={user} />
            ) : (
              // Si es admin, lo manda al admin, si no, al login
              esAdmin ? <Navigate to="/admin" /> : <Navigate to="/login" />
            )
          }
        />

        {/* Dashboard de Administrador */}
        <Route
          path="/admin"
          element={
            user && esAdmin ? (
              <AdminDashboard libros={libros || []} user={user} />
            ) : (
              // Si está logueado pero no es admin, lo manda a su panel. Si no, al login.
              user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />
            )
          }
        />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

export default App;