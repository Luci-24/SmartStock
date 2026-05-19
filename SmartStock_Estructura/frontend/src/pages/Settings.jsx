import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/Settings.css";

export default function Configuracion({ modoOscuro, setModoOscuro }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = React.useState({
    negocio: "",
    correo: "",
    tema: modoOscuro ? "Oscuro" : "Claro",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleGuardar = (e) => {
    e.preventDefault();
    alert("✅ Cambios guardados correctamente");
  };

  // Sincroniza el modo visual con el select de tema
  React.useEffect(() => {
    setForm((prev) => ({
      ...prev,
      tema: modoOscuro ? "Oscuro" : "Claro",
    }));
  }, [modoOscuro]);

  const handleTemaChange = (e) => {
    const nuevoTema = e.target.value;
    setForm({ ...form, tema: nuevoTema });
    setModoOscuro(nuevoTema === "Oscuro");
  };

  return (
    <div className={`config-layout ${modoOscuro ? "oscuro" : ""}`}>
      {/* ======== SIDEBAR ======== */}
      <aside className="sidebar">
        <div className="logo-container-sidebar">
          <div className="cube-inventory">
            <div className="face front"></div>
            <div className="face back"></div>
            <div className="face right"></div>
            <div className="face left"></div>
            <div className="face top"></div>
            <div className="face bottom"></div>
          </div>
          <h2 className="sidebar-title">SmartStock</h2>
        </div>

        <ul className="menu">
          <li
            className={location.pathname === "/inventory" ? "active" : ""}
            onClick={() => navigate("/inventory")}
          >
            📦 Inventario
          </li>
          <li
            className={location.pathname === "/ventas" ? "active" : ""}
            onClick={() => navigate("/ventas")}
          >
            💰 Vender
          </li>
          <li
            className={location.pathname === "/movimientos" ? "active" : ""}
            onClick={() => navigate("/movimientos")}
          >
            📈 Movimientos
          </li>
          <li
            className={location.pathname === "/empleados" ? "active" : ""}
            onClick={() => navigate("/empleados")}
          >
            👥 Empleados
          </li>
          <li
            className={location.pathname === "/configuracion" ? "active" : ""}
            onClick={() => navigate("/configuracion")}
          >
            ⚙️ Configuración
          </li>
        </ul>

        <div className="sidebar-bottom">
            <p>➕ Agregar otro negocio</p>
          <p
            className="logout"
            onClick={() => {
              localStorage.removeItem("usuarioLogueado");
              window.location.href = "/";
            }}
          >
            🚪 Cerrar sesión
          </p>
        </div>
      </aside>

      {/* ======== MAIN ======== */}
      <main className="config-main">
        <div className="config-header">
          <h1>⚙️ Configuración</h1>
          
        </div>

        <form className="config-form" onSubmit={handleGuardar}>
          <h2>Opciones Generales</h2>

          <label>Nombre del negocio:</label>
          <input
            type="text"
            name="negocio"
            placeholder="Ej: Mi Tienda S.A."
            value={form.negocio}
            onChange={handleChange}
          />

          <label>Correo de contacto:</label>
          <input
            type="email"
            name="correo"
            placeholder="correo@ejemplo.com"
            value={form.correo}
            onChange={handleChange}
          />

       

          <button type="submit" className="btn-guardar">
            💾 Guardar cambios
          </button>
        </form>
      </main>
    </div>
  );
}
