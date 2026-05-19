import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="logo-container-sidebar">
        <h2>SmartStock</h2>
      </div>

      <ul className="menu">
        <li><Link to="/inventory">📦 Inventario</Link></li>
        <li><Link to="/sale">💰 Vender</Link></li> {/* 👈 Aquí va la ruta nueva */}
        <li>📈 Movimientos</li>
        <li>👥 Empleados</li>
      </ul>

      <div className="sidebar-bottom">
        <p>⚙️ Configuración</p>
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
  );
}
