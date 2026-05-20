import { collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from './services/firestore';

import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from './services/supabaseClient'; 

import Login from './pages/Login.jsx';
import Landing from './pages/Landing.jsx'; // 1. Importamos la nueva Landing
import ProductoForm from './components/ProductoForm.jsx';
import ProductoList from './components/ProductoList.jsx';

function App() {
  const [user, setUser] = useState(null);
  const [libros, setLibros] = useState([]);
  const [cargando, setCargando] = useState(true);
  const navigate = useNavigate();

  // GESTIÓN DE SESIÓN (Supabase)
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setCargando(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // CARGAR DATOS PÚBLICOS (Firebase) - Ahora carga siempre para alimentar la Landing
  useEffect(() => {
    if (user) {
      // Escucha en tiempo real la colección de Firebase
      const unsub = onSnapshot(collection(db, "libros"), (snapshot) => {
        const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        setLibros(docs);
      });
      return () => unsub();
    } else {
      setLibros([]); // Limpiar lista si no hay usuario
    }
  }, [user]);

  // ACCIONES DE FIREBASE
  const crearProducto = async (nuevoProducto) => {
    await addDoc(collection(db, "libros"), nuevoProducto);
  };

  const eliminarProducto = async (id) => {
    await deleteDoc(doc(db, "libros", id));
  };

  const actualizarProducto = async (id, cambios) => {
    await updateDoc(doc(db, "libros", id), cambios);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    navigate('/'); // Redirigir a la landing al cerrar sesión
  };

  if (cargando) return <p>Cargando aplicación...</p>;

  return (
    <div className="app-container">
      {/* Barra de navegación superior (Solo si está logueado) */}
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

      <Routes>
        {/* RUTA RAÍZ: Ahora muestra la Landing Page de forma pública */}
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
              <main style={{ padding: '2rem' }}>
                <h1 style={{ marginBottom: '1.5rem' }}>Panel de Compra-Venta</h1>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
                  <ProductoForm onCrear={crearProducto} />
                  <div>
                    <h2>Mis publicaciones e inventario</h2>
                    <ProductoList 
                      libros={libros} 
                      onEliminar={eliminarProducto} 
                      onActualizar={actualizarProducto} 
                    />
                  </div>
                </div>
              </main>
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