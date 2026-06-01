import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, registrar, recuperarPassword } from '../services/authService';

export default function LoginForm() {
  // Estado para controlar qué formulario se muestra: 'login', 'registro' o 'recuperar'
  const [vista, setVista] = useState('login');
  
  // Estados de los campos del formulario
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [mensaje, setMensaje] = useState('');
  const navigate = useNavigate();

  // Estilos en línea para mantener el orden visual
  const styles = {
    container: { maxWidth: '400px', margin: '4rem auto', padding: '2rem', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', background: '#fff', fontFamily: 'sans-serif', position: 'relative' },
    title: { color: '#0f2027', marginBottom: '0.5rem', textAlign: 'center' },
    subtitle: { color: '#666', fontSize: '0.9rem', marginBottom: '1.5rem', textAlign: 'center' },
    input: { width: '100%', padding: '0.8rem', marginBottom: '1rem', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' },
    btnPrimary: { width: '100%', padding: '0.8rem', background: '#0f2027', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem', marginBottom: '0.5rem' },
    btnLink: { background: 'none', border: 'none', color: '#16a085', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.9rem', display: 'block', margin: '0.5rem auto' },
    message: { padding: '0.8rem', backgroundColor: '#f4f4f4', borderRadius: '5px', textAlign: 'center', fontSize: '0.9rem', color: '#333', marginTop: '1rem' },
    btnVolverInicio: { background: 'none', border: 'none', color: '#666', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.9rem', marginBottom: '1rem', padding: '0' }
  };

  // Limpiar mensajes y campos al cambiar de vista
  const cambiarVista = (nuevaVista) => {
    setVista(nuevaVista);
    setMensaje('');
    setPassword('');
    setConfirmPassword('');
  };

  // 1. MANEJAR INICIO DE SESIÓN (Adaptado al try/catch de Firebase)
  const manejarLogin = async (e) => {
    e.preventDefault();
    try {
      setMensaje('Iniciando sesión...');
      
      // authService ahora guarda automáticamente el token en localStorage si tiene éxito
      await login(email, password); 
      
      setMensaje('Sesión iniciada correctamente.');
      navigate('/dashboard'); 
    } catch (error) {
      // Captura el mensaje directo lanzado por el servicio
      setMensaje(error.message);
    }
  };

  // 2. MANEJAR REGISTRO (Adaptado al try/catch de Firebase)
  const manejarRegistro = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setMensaje('Las contraseñas no coinciden.');
      return;
    }

    try {
      setMensaje('Creando cuenta...');
      
      // Llamamos al servicio que registra en Firebase Auth e impacta tu base de datos
      await registrar(email, password, nombre, telefono);

      alert('¡Registro exitoso! Tu cuenta ha sido creada.');
      
      // Limpieza de campos por seguridad
      setNombre('');
      setTelefono('');
      setEmail('');
      
      cambiarVista('login');
    } catch (error) {
      setMensaje(error.message);
    }
  };

  // 3. MANEJAR RECUPERACIÓN DE CONTRASEÑA
  const manejarRecuperacion = async (e) => {
    e.preventDefault();
    try {
      setMensaje('Enviando correo...');
      await recuperarPassword(email);
      setMensaje('Se ha enviado un enlace de recuperación a tu correo electrónico.');
    } catch (error) {
      setMensaje(error.message);
    }
  };

  return (
    <section style={styles.container}>
      
      {/* Botón para regresar a la Landing Page pública */}
      <button 
        type="button" 
        onClick={() => navigate('/')} 
        style={styles.btnVolverInicio}
      >
        ⬅ Volver a Inicio
      </button>
      
      {/* VISTA 1: INICIAR SESIÓN */}
      {vista === 'login' && (
        <form onSubmit={manejarLogin}>
          <h2 style={styles.title}>Iniciar Sesión</h2>
          <p style={styles.subtitle}>Ingresa a Polilibros para contactar vendedores o publicar tus libros.</p>
          
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="usuario@correo.com" style={styles.input} />
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Contraseña" style={styles.input} />
          
          <button type="submit" style={styles.btnPrimary}>Ingresar</button>
          
          <button type="button" style={styles.btnLink} onClick={() => cambiarVista('registro')}>¿No tienes cuenta? Regístrate aquí</button>
          <button type="button" style={styles.btnLink} onClick={() => cambiarVista('recuperar')}>Olvidé mi contraseña</button>
        </form>
      )}

      {/* VISTA 2: REGISTRO DE USUARIOS */}
      {vista === 'registro' && (
        <form onSubmit={manejarRegistro}>
          <h2 style={styles.title}>Crear Cuenta</h2>
          <p style={styles.subtitle}>Regístrate con tus datos reales para coordinar las entregas en la Poli.</p>
          
          <input type="text" required value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre completo (Ej: Juan Pérez)" style={styles.input} />
          <input type="tel" required value={telefono} onChange={(e) => setTelefono(e.target.value)} placeholder="Número de teléfono / WhatsApp" style={styles.input} />
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Correo electrónico (Preferible institucional)" style={styles.input} />
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Contraseña (mínimo 6 caracteres)" style={styles.input} />
          <input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirmar contraseña" style={styles.input} />
          
          <button type="submit" style={styles.btnPrimary}>Registrarse</button>
          
          <button type="button" style={styles.btnLink} onClick={() => cambiarVista('login')}>¿Ya tienes cuenta? Inicia sesión</button>
        </form>
      )}

      {/* VISTA 3: CONTRASENA OLVIDADA */}
      {vista === 'recuperar' && (
        <form onSubmit={manejarRecuperacion}>
          <h2 style={styles.title}>Recuperar Contraseña</h2>
          <p style={styles.subtitle}>Escribe tu correo electrónico para enviarte un enlace de acceso.</p>
          
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="usuario@correo.com" style={styles.input} />
          
          <button type="submit" style={styles.btnPrimary}>Enviar enlace de recuperación</button>
          
          <button type="button" style={styles.btnLink} onClick={() => cambiarVista('login')}>Volver al inicio de sesión</button>
        </form>
      )}

      {/* MENSAJES DE ESTADO */}
      {mensaje && <div style={styles.message}>{mensaje}</div>}
    </section>
  );
}