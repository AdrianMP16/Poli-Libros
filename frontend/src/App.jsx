import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { auth } from './services/authService';
import { onAuthStateChanged } from 'firebase/auth';

import Login from './pages/Login.jsx';
import Landing from './pages/Landing.jsx';
import Dashboard from './pages/Dashboard.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';

function App() {
  const [user, setUser] = useState(null);

  //auth.signOut();  //Activar en caso de emergencia para cerrar sesión de forma segura y rápida a todos los usuarios (útil durante desarrollo o pruebas de roles)

  const [esAdmin, setEsAdmin] = useState(false); 
  const [libros, setLibros] = useState([]);
  const [cargando, setCargando] = useState(true);

  // 1. GESTIÓN DE SESIÓN Y ROLES (SEGURO)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          // 🛡️ Solo pedimos el token si 'firebaseUser' NO es null
          const tokenResult = await firebaseUser.getIdTokenResult();
          if (tokenResult.claims.admin === true) {
            setEsAdmin(true);
          } else {
            setEsAdmin(false);
          }
        } catch (error) {
          console.error("Error al verificar los claims:", error);
          setEsAdmin(false);
        }
      } else {
        // Si no está logueado, limpiamos los estados de forma segura
        setUser(null);
        setEsAdmin(false);
      }
      setCargando(false);
    });

    return () => unsubscribe();
  }, []);

  // 2. CARGAR LIBROS DESDE EL BACKEND EN EXPRESS
  useEffect(() => {
    const cargarLibrosDelBackend = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/libros");
        if (res.ok) {
          const datos = await res.json();
          setLibros(datos);
        }
      } catch (error) {
        console.error("Error al traer los libros de Express:", error);
      }
    };

    cargarLibrosDelBackend();
  }, []); // Array vacío para que solo se ejecute una vez al montar la app

  // 3. PANTALLA DE CARGA MIENTRAS FIREBASE DETERMINA SI HAY SESIÓN
  if (cargando) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
        <h3>Iniciando Polilibros...</h3>
        <p>Verificando credenciales de seguridad</p>
      </div>
    );
  }

  // 4. ENRUTAMIENTO SEGURO
  return (
    <div className="App">
      <Routes>
        {/* Ruta Pública Principal */}
        <Route path="/" element={<Landing libros={libros} user={user} />} />
        
        {/* Login con redirección inteligente */}
        <Route
          path="/login"
          element={!user ? <Login /> : (esAdmin ? <Navigate to="/admin" /> : <Navigate to="/dashboard" />)}
        />

        {/* Dashboard de Usuario Común (Pasamos el 'user' obligatoriamente) */}
        <Route
          path="/dashboard"
          element={user ? <Dashboard libros={libros} user={user} /> : <Navigate to="/login" />}
        />

        {/* Dashboard de Administrador */}
        <Route
          path="/admin"
          element={
            user && esAdmin ? (
              <AdminDashboard libros={libros} />
            ) : (
              user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />
            )
          }
        />

        {/* Cualquier otra ruta manda a la Landing */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

export default App;