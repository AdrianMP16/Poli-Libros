import { collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from './services/firestore';

import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { auth } from './services/authService';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';

import Login from './pages/Login.jsx';
import Landing from './pages/Landing.jsx';
import Dashboard from './pages/Dashboard.jsx';

function App() {
  const [user, setUser] = useState(null);
  const [libros, setLibros] = useState([]);
  const [cargando, setCargando] = useState(true);
  const navigate = useNavigate();

// GESTIÓN DE SESIÓN (Ahora con Firebase Auth)
useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
    setUser(firebaseUser);
    setCargando(false);
  });

  return () => unsubscribe();
}, []);

  // CARGAR DATOS PÚBLICOS (Firebase) - Carga siempre de forma pública
  useEffect(() => {
    // Escucha en tiempo real la colección de Firebase sin importar el usuario
    const unsub = onSnapshot(collection(db, "libros"), (snapshot) => {
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setLibros(docs);
    });
    
    return () => unsub();
  }, []); // Quitamos 'user' de las dependencias para que no se reinicie al desloguearse

  // ACCIONES DE FIREBASE
  const crearProducto = async (nuevoProducto) => {
    await addDoc(collection(db, "libros"), {
      ...nuevoProducto,
      usuario_id: user?.id || ''
    });
  };

  const eliminarProducto = async (id) => {
    await deleteDoc(doc(db, "libros", id));
  };

  const actualizarProducto = async (id, cambios) => {
    await updateDoc(doc(db, "libros", id), cambios);
  };

  const logout = async () => {
  await firebaseSignOut(auth);
  navigate('/'); 
};

  if (cargando) return <p>Cargando aplicación...</p>;

  return (
    <div className="app-container">
      {user && (
        <nav style={{ padding: '1rem', background: '#f4f4f4', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ cursor: 'pointer', fontWeight: 'bold', marginRight: '1.5rem' }} onClick={() => navigate('/')}>
              Polilibros 📚
            </span>
            <span>Sesión: <strong>{user.email}</strong></span>
          </div>
          <div>
            <button style={{ marginRight: '1rem' }} onClick={() => navigate('/dashboard')}>Mi Panel</button>
            <button onClick={logout}>Cerrar Sesión</button>
          </div>
        </nav>
      )}

{/* RUTA RAÍZ: Ahora muestra la Landing Page de forma pública */}
      <Routes>
        <Route 
          path="/" 
          element={<Landing libros={libros} user={user} />} 
        />


{/* LOGIN: Redirige al Dashboard si ya inició sesión */}
        <Route 
          path="/login" 
          element={!user ? <Login /> : <Navigate to="/dashboard" />} 
        />

{/* DASHBOARD PRIVADO: Gestión de inventario (Antes estaba en la raíz) */}
        <Route 
          path="/dashboard" 
          element={
            user ? (
              <Dashboard 
                libros={libros} 
                onCrear={crearProducto} 
                onEliminar={eliminarProducto} 
                onActualizar={actualizarProducto} 
              />
            ) : (
              <Navigate to="/login" />
            )
          } 
        />

 {/* Redirección por defecto */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

export default App;