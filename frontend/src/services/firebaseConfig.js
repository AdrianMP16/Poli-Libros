import { initializeApp } from "firebase/app";

// Configuración para el navegador
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};
console.log("¿La API Key es undefined?", import.meta.env.VITE_FIREBASE_API_KEY === undefined);
console.log("Valor real de la API Key:", import.meta.env.VITE_FIREBASE_API_KEY);
export const app = initializeApp(firebaseConfig);
