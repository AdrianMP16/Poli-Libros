import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail,
  signOut,
  updatePassword, // Para cambiar la contraseña desde el perfil
  updateProfile   // Para cambiar el nombre visible en Firebase
} from "firebase/auth";
import { app } from "./firestore"; 

// Exportamos 'auth' directamente para que Dashboard.jsx pueda leer 'auth.currentUser'
export const auth = getAuth(app);
const API_URL = "http://localhost:3000/api";

// 1. INICIAR SESIÓN
export const login = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const token = await user.getIdToken();
    localStorage.setItem("token", token);
    return { user, token };
  } catch (error) {
    throw new Error(error.message);
  }
};

// 2. REGISTRAR UN NUEVO USUARIO
export const registrar = async (email, password, nombre, telefono) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Guardamos el nombre en el perfil nativo de Firebase Auth
    await updateProfile(user, { displayName: nombre });
    
    const token = await user.getIdToken();
    localStorage.setItem("token", token);

    // Guardar datos extra como el teléfono en tu backend remoto
    try {
      await fetch(`${API_URL}/usuarios`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ nombre, telefono, email, uid: user.uid })
      });
    } catch (apiError) {
      console.error("Error al registrar usuario en el backend:", apiError);
    }

    return { user, token };
  } catch (error) {
    throw new Error(error.message);
  }
};

// 3. RECUPERAR CONTRASEÑA
export const recuperarPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { exito: true };
  } catch (error) {
    throw new Error(error.message);
  }
};

// 4. CERRAR SESIÓN
export const cerrarSesion = async () => {
  await signOut(auth);
  localStorage.removeItem("token");
};

// 5. ACTUALIZAR DATOS DEL PERFIL (Faltante para el Dashboard)
export const actualizarDatosPerfil = async (uid, nombre, telefono) => {
  try {
    const token = await auth.currentUser.getIdToken();
    
    // Actualizamos el nombre en el Auth de Firebase Client
    await updateProfile(auth.currentUser, { displayName: nombre });

    // Mandamos los datos actualizados a tu backend para sincronizar Firestore de forma segura
    const respuesta = await fetch(`${API_URL}/usuarios/${uid}`, {
      method: "PUT", // o PATCH dependiendo de tu backend
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ nombre, telefono })
    });

    if (!respuesta.ok) {
      const errorData = await respuesta.json();
      throw new Error(errorData.mensaje || "Error al actualizar en el servidor");
    }

    return { exito: true };
  } catch (error) {
    throw new Error(error.message);
  }
};

// 6. CAMBIAR CONTRASEÑA INTERNA (Faltante para el Dashboard)
export const cambiarContrasenaInterna = async (nuevaContrasena) => {
  try {
    const usuario = auth.currentUser;
    if (!usuario) throw new Error("No hay un usuario autenticado");

    // Método nativo directo del cliente de Firebase para cambiar credenciales
    await updatePassword(usuario, nuevaContrasena);
    return { exito: true };
  } catch (error) {
    throw new Error(error.message);
  }
};