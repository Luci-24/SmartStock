// authService.js — reemplaza el antiguo que usaba Supabase
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../supabase/firebaseCliente";

// ─── REGISTRO ────────────────────────────────────────────────────────────────
// Equivalente a: supabase.auth.signUp()
export async function register({ nombre_completo, correo, usuario, password }) {
  // 1. Crear usuario en Firebase Auth
  const { user } = await createUserWithEmailAndPassword(auth, correo, password);

  // 2. Guardar datos extra en Firestore (colección "usuarios")
  //    Firebase Auth solo guarda email/password; el resto va en Firestore
  await setDoc(doc(db, "usuarios", user.uid), {
    nombre_completo,
    correo,
    usuario,
    creado_en: serverTimestamp(),
  });

  return user;
}

// ─── LOGIN ────────────────────────────────────────────────────────────────────
// Equivalente a: supabase.auth.signInWithPassword()
export async function login(correo, password) {
  const { user } = await signInWithEmailAndPassword(auth, correo, password);
  return user;
}

// ─── LOGOUT ──────────────────────────────────────────────────────────────────
// Equivalente a: supabase.auth.signOut()
export async function logout() {
  await signOut(auth);
}

// ─── OBTENER USUARIO ACTUAL ───────────────────────────────────────────────────
// Equivalente a: supabase.auth.getUser()
export function getCurrentUser() {
  return auth.currentUser;
}

// ─── ESCUCHAR CAMBIOS DE SESIÓN ───────────────────────────────────────────────
// Equivalente a: supabase.auth.onAuthStateChange()
// Úsalo en App.jsx o en un contexto de autenticación
export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}

// ─── OBTENER PERFIL DEL USUARIO DESDE FIRESTORE ───────────────────────────────
export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, "usuarios", uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}