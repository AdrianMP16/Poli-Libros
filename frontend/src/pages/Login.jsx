import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, registrar, recuperarPassword } from '../services/authService';
import '../styles/Login.css';

const traducirErrorFirebase = (errorObjeto) => {
  const err = String(errorObjeto).toLowerCase();

  if (err.includes('invalid-credential') || err.includes('wrong-password') || err.includes('user-not-found')) {
    return 'El correo o la contraseña son incorrectos.';
  }
  if (err.includes('invalid-email')) {
    return 'El formato del correo electrónico no es válido.';
  }
  if (err.includes('email-already-in-use')) {
    return 'Este correo ya está registrado en PoliLibros.';
  }
  if (err.includes('weak-password')) {
    return 'La contraseña es demasiado débil (mínimo 6 caracteres).';
  }
  if (err.includes('too-many-requests')) {
    return 'Demasiados intentos fallidos. Por favor, intenta de nuevo más tarde.';
  }
  if (err.includes('network-request-failed')) {
    return 'Error de conexión. Revisa tu internet.';
  }
  
  return 'Ocurrió un error inesperado. Inténtalo de nuevo.';
};

export default function LoginForm() {
  const [vista, setVista] = useState('login');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [mensaje, setMensaje] = useState('');
  const navigate = useNavigate();

  // Estados independientes para controlar la visibilidad de las contraseñas
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const cambiarVista = (nuevaVista) => {
    setVista(nuevaVista);
    setMensaje('');
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const manejarLogin = async (e) => {
    e.preventDefault();
    try {
      setMensaje('Iniciando sesión...');
      await login(email, password); 
      setMensaje('Sesión iniciada correctamente.');
      setTimeout(() => {
        navigate('/dashboard');
      }, 600);
    } catch (error) {
      const mensajeError = traducirErrorFirebase(error.code || error.message);
      setMensaje('Error: ' + mensajeError);
    }
  };

  const manejarRegistro = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setMensaje('Las contraseñas no coinciden.');
      return;
    }

    try {
      setMensaje('Creando cuenta...');
      await registrar(email, password, nombre, telefono);
      alert('¡Registro exitoso! Tu sesión ha sido iniciada.');
      navigate('/dashboard');
    } catch (error) {
      const mensajeError = traducirErrorFirebase(error.code || error.message);
      setMensaje('Error: ' + mensajeError);
    }
  };

  const manejarRecuperacion = async (e) => {
    e.preventDefault();
    try {
      setMensaje('Enviando correo...');
      await recuperarPassword(email);
      setMensaje('Se ha enviado un enlace de recuperación a tu correo electrónico.');
    } catch (error) {
      const mensajeError = traducirErrorFirebase(error.code || error.message);
      setMensaje('Error: ' + mensajeError);
    }
  };

  return (
    <div className="login-page-container">
      <div className="login-card-box">
        
        {/* Botón flotante superior para volver */}
        <button type="button" onClick={() => navigate('/')} className="btn-back-home">
          ⬅ Volver a Inicio
        </button>

        {/* Encabezado con la marca */}
        <div className="login-header text-center">
          <h2 className="login-brand" onClick={() => navigate('/')}>
            PoliLibros <span className="brand-emoji">📚</span>
          </h2>
        </div>

        {/* Notificaciones dinámicas de estado/error */}
        {mensaje && (
          <div className={`auth-status-message ${mensaje.toLowerCase().includes('error') ? 'error-style' : 'success-style'}`}>
            {mensaje}
          </div>
        )}

        {/* VISTA 1: INICIAR SESIÓN */}
        {vista === 'login' && (
          <form onSubmit={manejarLogin} className="login-form-element">
            <h2 className="login-title">Iniciar Sesión</h2>
            <p className="login-subtitle">Ingresa a Polilibros para contactar vendedores o publicar tus libros.</p>
            
            <div className="input-group-layout">
              <div className="input-field-wrapper">
                <span className="input-icon">✉️</span>
                <input 
                  type="email" 
                  name="email"
                  autoComplete="email"
                  required 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="usuario@correo.com" 
                  className="login-input-field" 
                />
              </div>
            </div>

            <div className="input-group-layout">
              <div className="input-field-wrapper">
                <span className="input-icon">🔒</span>
                <input 
                  type={showPassword ? "text" : "password"} 
                  name="password"
                  autoComplete="current-password"
                  required 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="Contraseña" 
                  className="login-input-field" 
                />
                <button 
                  type="button" 
                  className="btn-toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? "👁️" : "🙈"}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-auth-primary">Ingresar</button>
            
            <div className="login-toggle-footer text-center">
              <button type="button" className="btn-auth-link" onClick={() => cambiarVista('registro')}>
                ¿No tienes cuenta? <span className="highlight-text">Regístrate aquí</span>
              </button>
              <button type="button" className="btn-auth-link font-small" onClick={() => cambiarVista('recuperar')}>
                Olvidé mi contraseña
              </button>
            </div>
          </form>
        )}

        {/* VISTA 2: REGISTRO */}
        {vista === 'registro' && (
          <form onSubmit={manejarRegistro} className="login-form-element">
            <h2 className="login-title">Crear Cuenta</h2>
            <p className="login-subtitle">Regístrate con tus datos reales para coordinar las entregas en la Poli.</p>
            
            <div className="input-group-layout">
              <div className="input-field-wrapper">
                <span className="input-icon">👤</span>
                <input 
                  type="text" 
                  name="username"
                  autoComplete="name"
                  required 
                  value={nombre} 
                  onChange={(e) => setNombre(e.target.value)} 
                  placeholder="Nombre completo (Ej: Juan Pérez)" 
                  className="login-input-field" 
                />
              </div>
            </div>

            <div className="input-group-layout">
              <div className="input-field-wrapper">
                <span className="input-icon">📞</span>
                <input 
                  type="tel" 
                  name="tel"
                  autoComplete="tel"
                  required 
                  value={telefono} 
                  onChange={(e) => setTelefono(e.target.value)} 
                  placeholder="Número de teléfono / WhatsApp" 
                  className="login-input-field" 
                />
              </div>
            </div>

            <div className="input-group-layout">
              <div className="input-field-wrapper">
                <span className="input-icon">✉️</span>
                <input 
                  type="email" 
                  name="email"
                  autoComplete="email"
                  required 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="Correo electrónico" 
                  className="login-input-field" 
                />
              </div>
            </div>

            <div className="input-group-layout">
              <div className="input-field-wrapper">
                <span className="input-icon">🔒</span>
                <input 
                  type={showPassword ? "text" : "password"} 
                  name="new-password"
                  autoComplete="new-password"
                  required 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="Contraseña (mínimo 6 caracteres)" 
                  className="login-input-field" 
                />
                <button 
                  type="button" 
                  className="btn-toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "👁️" : "🙈"}
                </button>
              </div>
            </div>

            <div className="input-group-layout">
              <div className="input-field-wrapper">
                <span className="input-icon">🔒</span>
                <input 
                  type={showConfirmPassword ? "text" : "password"} 
                  name="confirm-password"
                  autoComplete="new-password"
                  required 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                  placeholder="Confirmar contraseña" 
                  className="login-input-field" 
                />
                <button 
                  type="button" 
                  className="btn-toggle-password"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? "👁️" : "🙈"}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-auth-primary">Registrarse</button>
            
            <div className="login-toggle-footer text-center">
              <button type="button" className="btn-auth-link" onClick={() => cambiarVista('login')}>
                ¿Ya tienes cuenta? <span className="highlight-text">Inicia sesión</span>
              </button>
            </div>
          </form>
        )}

        {/* VISTA 3: RECUPERACIÓN */}
        {vista === 'recuperar' && (
          <form onSubmit={manejarRecuperacion} className="login-form-element">
            <h2 className="login-title">Recuperar Contraseña</h2>
            <p className="login-subtitle">Escribe tu correo electrónico para enviarte un enlace de acceso.</p>
            
            <div className="input-group-layout">
              <div className="input-field-wrapper">
                <span className="input-icon">✉️</span>
                <input 
                  type="email" 
                  name="email"
                  autoComplete="email"
                  required 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="usuario@correo.com" 
                  className="login-input-field" 
                />
              </div>
            </div>

            <button type="submit" className="btn-auth-primary">Enviar enlace de recuperación</button>
            
            <div className="login-toggle-footer text-center">
              <button type="button" className="btn-auth-link" onClick={() => cambiarVista('login')}>
                Volver al inicio de sesión
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}