import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail,
  updateProfile,
  updatePassword
} from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
const db = getFirestore(app);

export const login = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error) {
    return { user: null, error };
  }
};

export const registrar = async (email, password, nombre, telefono) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await updateProfile(user, { displayName: nombre });

    await setDoc(doc(db, "usuarios", user.uid), {
      nombre: nombre,
      telefono: telefono,
      email: email,
      fecha_registro: new Date()
    });

    return { user, error: null };
  } catch (error) {
    return { user: null, error };
  }
};

export const recuperarPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { error: null };
  } catch (error) {
    return { error };
  }
};

export const actualizarDatosPerfil = async (uid, nombre, telefono) => {
  try {
    if (auth.currentUser) {
      await updateProfile(auth.currentUser, { displayName: nombre });
    }
    await setDoc(doc(db, "usuarios", uid), {
      nombre: nombre,
      telefono: telefono,
      email: auth.currentUser.email,
      fecha_actualizacion: new Date()
    }, { merge: true });
    return { error: null };
  } catch (error) {
    return { error };
  }
};

export const cambiarContrasenaInterna = async (nuevaContrasena) => {
  try {
    if (auth.currentUser) {
      await updatePassword(auth.currentUser, nuevaContrasena);
      return { error: null };
    }
    throw new Error("No hay un usuario autenticado");
  } catch (error) {
    return { error };
  }
};