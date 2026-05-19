import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/app.css";
import { db } from "../supabase/firebaseCliente";
import { login } from "../services/authService";
import { collection, query, where, getDocs } from "firebase/firestore";

export default function Login() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState("");
  const [contraseña, setContraseña] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const q = query(
        collection(db, "usuarios"),
        where("usuario", "==", usuario)
      );
      const snap = await getDocs(q);

      if (snap.empty) {
        setError("❌ Usuario no encontrado");
        return;
      }

      const userData = { id: snap.docs[0].id, ...snap.docs[0].data() };

      const user = await login(userData.correo, contraseña);

      localStorage.setItem("usuarioLogueado", JSON.stringify({
        id: user.uid,
        usuario: userData.usuario,
        nombre_completo: userData.nombre_completo,
        correo: userData.correo,
      }));

      localStorage.setItem("recienLogueado", "true"); // 👈 flag para el saludo

      navigate("/Inventory");
    } catch (err) {
      console.error(err);
      setError("❌ Contraseña incorrecta");
    }
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <div className="cube-logo">
          <div className="cube">
            <div className="face front"></div>
            <div className="face back"></div>
            <div className="face right"></div>
            <div className="face left"></div>
            <div className="face top"></div>
            <div className="face bottom"></div>
          </div>
        </div>
        <h1>SmartStock</h1>
        <p>Gestión inteligente de inventario</p>
      </div>

      <div className="login-right">
        <div className="login-card">
          <h2>Inicia sesión</h2>
          <form className="login-form" onSubmit={handleLogin}>
            <input
              type="text"
              placeholder="Usuario"
              className="login-input"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Contraseña"
              className="login-input"
              value={contraseña}
              onChange={(e) => setContraseña(e.target.value)}
              required
            />
            <button type="submit" className="login-button">
              Entrar
            </button>
          </form>

          {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}

          <div className="login-links">
            <Link to="/register">Crear cuenta</Link>
          </div>
        </div>
      </div>
    </div>
  );
}