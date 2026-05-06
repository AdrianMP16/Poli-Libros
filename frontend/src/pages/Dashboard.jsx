function Dashboard({ user, onLogout }) {
  return (
    <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h1>Bienvenido a Polilibros</h1>
      <p>Has iniciado sesión como: <strong>{user.email}</strong></p>
      <button 
        onClick={onLogout}
        style={{
          padding: '10px 20px',
          marginTop: '20px',
          background: '#e74c3c',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer'
        }}
      >
        Cerrar Sesión
      </button>
    </div>
  )
}

export default Dashboard