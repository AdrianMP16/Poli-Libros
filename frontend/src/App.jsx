import { Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from './services/supabaseClient'; // Tu config de Supabase

import Login from './pages/Login.jsx';
import ProductoForm from './components/ProductoForm.jsx';
import ProductoList from './components/ProductoList.jsx';

function App() {
  const [user, setUser] = useState(null);
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);

  // 1. GESTIÓN DE SESIÓN (Supabase)
  useEffect(() => {
    // Verificar sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setCargando(false);
    });

    // Escuchar cambios de login/logout
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 2. CARGAR DATOS (Firebase) - Solo si hay usuario de Supabase
  useEffect(() => {
    if (user) {
      // Escucha en tiempo real la colección de Firebase
      const unsub = onSnapshot(collection(db, "productos"), (snapshot) => {
        const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        setProductos(docs);
      });
      return () => unsub();
    } else {
      setProductos([]); // Limpiar lista si no hay usuario
    }
  }, [user]);

  // 3. ACCIONES DE FIREBASE
  const crearProducto = async (nuevoProducto) => {
    await addDoc(collection(db, "productos"), nuevoProducto);
  };

  const eliminarProducto = async (id) => {
    await deleteDoc(doc(db, "productos", id));
  };

  const actualizarProducto = async (id, cambios) => {
    await updateDoc(doc(db, "productos", id), cambios);
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  if (cargando) return <p>Cargando aplicación...</p>;

  return (
    <div className="app-container">
      {user && (
        <nav style={{ padding: '1rem', background: '#f4f4f4', display: 'flex', justifyContent: 'space-between' }}>
          <span>Sesión iniciada: <strong>{user.email}</strong></span>
          <button onClick={logout}>Cerrar Sesión</button>
        </nav>
      )}

      <Routes>
        <Route 
          path="/login" 
          element={!user ? <Login /> : <Navigate to="/" />} 
        />

        <Route 
          path="/" 
          element={
            user ? (
              <main style={{ padding: '2rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
                  <ProductoForm onCrear={crearProducto} />
                  <div>
                    <h2>Inventario (Firebase)</h2>
                    <ProductoList 
                      productos={productos} 
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

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

export default App;