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
          // 1. Forzamos la actualización del token y obtenemos los claims
          const tokenResult = await firebaseUser.getIdTokenResult(true);
          const token = tokenResult.token; // Extraemos el token directamente de aquí

          // 2. Verificamos la sanción en tu API backend
          const res = await fetch("http://127.0.0.1:3000/api/usuarios/verificar-sancion", {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });

          const datos = await res.json();

          // 3. Si está suspendido, lo expulsamos inmediatamente y detenemos el flujo
          if (datos.suspendido) {
            alert(`Tu cuenta está suspendida hasta ${datos.fechaFin}`);
            await signOut(auth); // Esto volverá a disparar onAuthStateChanged con firebaseUser = null

            setUser(null);
            setEsAdmin(false);
            setCargando(false);
            return; // Clave: Salimos para que no se ejecute el código de abajo
          }

          // 4. Si NO está suspendido, guardamos los datos del usuario en el estado
          console.log("UID:", firebaseUser.uid);
          console.log("Claims:", tokenResult.claims);

          setUser(firebaseUser);
          setEsAdmin(tokenResult.claims.role === "admin");

        } catch (error) {
          console.error("Error al verificar los claims o la sanción:", error);
          setUser(null);
          setEsAdmin(false);
        }
      } else {
        // Flujo cuando no hay usuario (ej. si hizo signOut o no ha iniciado sesión)
        setUser(null);
        setEsAdmin(false);
      }

      // SOLO CUANDO TODO ESTÁ LISTO (sea éxito, error, o sin sesión), quitamos la carga
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

  const handleCrearLibro = async (nuevoLibro) => {
    try {
      const token = await auth.currentUser.getIdToken();
      const res = await fetch("http://localhost:3000/api/libros", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(nuevoLibro)
      });

      if (res.ok) {
        alert("Libro publicado con éxito");
        cargarLibrosDelBackend(); // Recargamos el catálogo
      } else {
        const errorData = await res.json();
        alert("Error al publicar: " + errorData.mensaje);
      }
    } catch (error) {
      console.error("Error de conexión:", error);
    }
  };

  const handleEliminarLibro = async (idLibro) => {
    if (!window.confirm("¿Seguro que deseas eliminar este libro?")) return;
    try {
      const token = await auth.currentUser.getIdToken();
      const res = await fetch(`http://localhost:3000/api/libros/${idLibro}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (res.ok) {
        cargarLibrosDelBackend(); // Recargamos el catálogo
      } else {
        alert("Error al eliminar el libro");
      }
    } catch (error) {
      console.error("Error de conexión:", error);
    }
  };

  const handleCerrarSesion = async () => {
    await signOut(auth);
    localStorage.clear();
    window.location.href = '/';
  };

  // 3. PANTALLA DE CARGA BLINDADA
  if (cargando) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#111', color: 'white' }}>
        <h2>Cargando Polilibros... Verificando accesos.</h2>
      </div>
    );
  }

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
          element={ user && !esAdmin ? (
              <Dashboard libros={libros || []} user={user} onCrear={handleCrearLibro} onEliminar={handleEliminarLibro} />
            ) : (esAdmin ? <Navigate to="/admin" /> : <Navigate to="/login" />)
          }
        />

        {/* Dashboard de Administrador */}
        <Route
          path="/admin"
          element={ user && esAdmin ? (
              <AdminDashboard libros={libros || []} user={user} onCrear={handleCrearLibro} onEliminar={handleEliminarLibro} />
            ) : (user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />)
          }
        />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

export default App;