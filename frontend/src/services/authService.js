import { supabase } from './supabaseClient';

export async function registrar(email, password, nombre, telefono) {
  return await supabase.auth.signUp({ 
    email, 
    password,
    options: {
      data: {
        nombre_completo: nombre, 
        telefono: telefono
      }
    }
  });
}

export async function login(email, password) {
  return await supabase.auth.signInWithPassword({ email, password });
}

export async function logout() {
  return await supabase.auth.signOut();
}

export async function recuperarPassword(email) {
  return await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin + '/login',
  });
}

export async function obtenerSesion() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export function escucharSesion(callback) {
  return supabase.auth.onAuthStateChange((_event, session) => callback(session));
}

export async function obtenerToken() {
  const session = await obtenerSesion();
  return session?.access_token || null;
}