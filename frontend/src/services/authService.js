import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail,
  signOut,
  updatePassword, 
  updateProfile   
} from "firebase/auth";
import { app } from "./firebaseConfig"; 

export const auth = getAuth(app);
const API_URL = "http://localhost:3000/api";

// 1. INICIAR SESIÓN
export const login = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Extraemos los claims del token para verificar el rol
    const tokenResult = await user.getIdTokenResult();
    const rol = tokenResult.claims.role || "comun"; 

    localStorage.setItem("token", tokenResult.token);
    localStorage.setItem("rol", rol); 

    return { user, token: tokenResult.token, rol };
  } catch (error) {
    throw new Error(error.message);
  }
};

// 2. REGISTRAR UN NUEVO USUARIO
export const registrar = async (email, password, nombre, telefono) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    await updateProfile(user, { displayName: nombre });
    
    const token = await user.getIdToken();
    localStorage.setItem("token", token);
    localStorage.setItem("rol", "comun"); // Por defecto, todo registro nuevo es común

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
  localStorage.removeItem("rol");
};

// 5. ACTUALIZAR DATOS DEL PERFIL
export const actualizarDatosPerfil = async (uid, nombre, telefono) => {
  try {
    const token = await auth.currentUser.getIdToken();
    await updateProfile(auth.currentUser, { displayName: nombre });

    const respuesta = await fetch(`${API_URL}/usuarios/${uid}`, {
      method: "PUT",
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

// 6. CAMBIAR CONTRASEÑA INTERNA
export const cambiarContrasenaInterna = async (nuevaContrasena) => {
  try {
    const usuario = auth.currentUser;
    if (!usuario) throw new Error("No hay un usuario autenticado");

    await updatePassword(usuario, nuevaContrasena);
    return { exito: true };
  } catch (error) {
    throw new Error(error.message);
  }
};