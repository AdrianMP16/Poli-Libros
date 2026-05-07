import { Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Home from './pages/Home';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (email, password) => {
    if (email && password) {
      const userData = { id: 1, name: "Usuario Polilibros", email };
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (

    <Routes>
      <Route path="/login" element={!user ? <Login onLogin={login} /> : <Navigate to="/" />} />
      <Route path="/" element={user ? <Home user={user} onLogout={logout} /> : <Navigate to="/login" />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>

  );
}

export default App;