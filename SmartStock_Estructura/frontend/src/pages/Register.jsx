import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Register.css";
import { register } from "../services/authService";

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre_completo: "",
    correo: "",
    usuario: "",
    contraseña: "",
  });

  const [mensaje, setMensaje] = useState({ texto: "", tipo: "" });

  const mostrarMensaje = (texto, tipo = "info") => {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje({ texto: "", tipo: "" }), 3000);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      // Firebase no requiere confirmación de correo por defecto
      // El registro crea el usuario en Auth y guarda el perfil en Firestore
      await register({
        nombre_completo: formData.nombre_completo,
        correo: formData.correo,
        usuario: formData.usuario,
        password: formData.contraseña,
      });

      mostrarMensaje("✅ Cuenta creada exitosamente", "success");
      setTimeout(() => navigate("/"), 3000);
    } catch (err) {
      console.error(err);
      if (err.code === "auth/email-already-in-use") {
        mostrarMensaje("❌ Este correo ya está registrado", "error");
      } else if (err.code === "auth/weak-password") {
        mostrarMensaje("❌ La contraseña debe tener al menos 6 caracteres", "error");
      } else {
        mostrarMensaje("❌ Error al crear la cuenta", "error");
      }
    }
  };

  return (
    <div className="register-container">
      {/* IZQUIERDA */}
      <div className="register-left">
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
        <p>Regístrate y empieza a gestionar tu inventario</p>
      </div>

      {/* DERECHA */}
      <div className="register-right">
        <div className="register-card">
          <h2>Crear cuenta</h2>
          <form className="register-form" onSubmit={handleRegister}>
            <input
              type="text"
              name="nombre_completo"
              placeholder="Nombre completo"
              value={formData.nombre_completo}
              onChange={handleChange}
              required
            />
            <input
              type="email"
              name="correo"
              placeholder="Correo electrónico"
              value={formData.correo}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="usuario"
              placeholder="Usuario"
              value={formData.usuario}
              onChange={handleChange}
              required
            />
            <input
              type="password"
              name="contraseña"
              placeholder="Contraseña"
              value={formData.contraseña}
              onChange={handleChange}
              required
            />
            <button type="submit" className="register-button">
              Registrarse
            </button>
          </form>

          <div className="register-links">
            <Link to="/">Volver al inicio</Link>
          </div>
        </div>
      </div>

      {/* MENSAJE */}
      {mensaje.texto && (
        <div className={`mensaje-central ${mensaje.tipo}`}>
          <div className="mensaje-box">{mensaje.texto}</div>
        </div>
      )}
    </div>
  );
}
