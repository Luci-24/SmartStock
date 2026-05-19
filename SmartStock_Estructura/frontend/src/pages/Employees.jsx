import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { db } from "../supabase/firebaseCliente"; // ✅ Cambiado
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import "../styles/Employees.css";

export default function Employees() {
  const navigate = useNavigate();
  const location = useLocation();
  const [empleados, setEmpleados] = useState([]);
  const [nuevoEmpleado, setNuevoEmpleado] = useState({
    nombre_completo: "",
    cargo: "",
    correo: "",
    telefono: "",
  });

  const [mostrarModal, setMostrarModal] = useState(false);
  const [empleadoAEliminar, setEmpleadoAEliminar] = useState(null);
  const [mensaje, setMensaje] = useState({ texto: "", tipo: "" });

  useEffect(() => {
    obtenerEmpleados();
  }, []);

  async function obtenerEmpleados() {
    try {
      const q = query(collection(db, "empleados"), orderBy("creado_en", "asc"));
      const snap = await getDocs(q);
      const data = snap.docs.map((d, i) => ({ id: d.id, _index: i + 1, ...d.data() }));
      setEmpleados(data);
    } catch (err) {
      console.error("Error cargando empleados:", err);
    }
  }

  async function agregarEmpleado(e) {
    e.preventDefault();
    try {
      await addDoc(collection(db, "empleados"), {
        ...nuevoEmpleado,
        creado_en: serverTimestamp(),
      });
      setNuevoEmpleado({ nombre_completo: "", cargo: "", correo: "", telefono: "" });
      mostrarMensaje("✅ Empleado agregado con éxito", "exito");
      obtenerEmpleados();
    } catch (err) {
      mostrarMensaje("❌ Error al agregar empleado", "error");
    }
  }

  function mostrarMensaje(texto, tipo) {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje({ texto: "", tipo: "" }), 2000);
  }

  async function eliminarEmpleadoConfirmado() {
    try {
      await deleteDoc(doc(db, "empleados", empleadoAEliminar.id));
      setMostrarModal(false);
      mostrarMensaje("🗑️ Empleado eliminado correctamente", "exito");
      obtenerEmpleados();
    } catch (err) {
      mostrarMensaje("❌ Error al eliminar empleado", "error");
    }
  }

  return (
    <div className="movements-layout">
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
          <li onClick={() => navigate("/inventory")} className={location.pathname === "/inventory" ? "active" : ""}>📦 Inventario</li>
          <li onClick={() => navigate("/ventas")} className={location.pathname === "/ventas" ? "active" : ""}>💰 Vender</li>
          <li onClick={() => navigate("/movimientos")} className={location.pathname === "/movimientos" ? "active" : ""}>📈 Movimientos</li>
          <li onClick={() => navigate("/empleados")} className={location.pathname === "/empleados" ? "active" : ""}>👥 Empleados</li>
          <li onClick={() => navigate("/configuracion")} className={location.pathname === "/configuracion" ? "active" : ""}>⚙️ Configuración</li>
        </ul>
        <div className="sidebar-bottom">
          <p>➕ Agregar otro negocio</p>
          <p className="logout" onClick={() => { localStorage.removeItem("usuarioLogueado"); window.location.href = "/"; }}>
            🚪 Cerrar sesión
          </p>
        </div>
      </aside>

      <main className="movements-main">
        <div className="movements-header">
          <h1>Empleados</h1>
        </div>

        <div className="filter-bar">
          <form onSubmit={agregarEmpleado} className="form-empleado">
            <input type="text" placeholder="Nombre completo" value={nuevoEmpleado.nombre_completo}
              onChange={(e) => setNuevoEmpleado({ ...nuevoEmpleado, nombre_completo: e.target.value })} required />
            <input type="text" placeholder="Cargo" value={nuevoEmpleado.cargo}
              onChange={(e) => setNuevoEmpleado({ ...nuevoEmpleado, cargo: e.target.value })} required />
            <input type="email" placeholder="Correo" value={nuevoEmpleado.correo}
              onChange={(e) => setNuevoEmpleado({ ...nuevoEmpleado, correo: e.target.value })} required />
            <input type="text" placeholder="Teléfono" value={nuevoEmpleado.telefono}
              onChange={(e) => setNuevoEmpleado({ ...nuevoEmpleado, telefono: e.target.value })} />
            <button type="submit" className="btn-filter active">➕ Agregar</button>
          </form>
        </div>

        <div className="movements-table">
          <h2>Lista de Empleados</h2>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Nombre</th>
                <th>Cargo</th>
                <th>Correo</th>
                <th>Teléfono</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {empleados.length > 0 ? (
                empleados.map((e) => (
                  <tr key={e.id}>
                    <td>{e._index}</td>
                    <td>{e.nombre_completo}</td>
                    <td>{e.cargo}</td>
                    <td>{e.correo}</td>
                    <td>{e.telefono}</td>
                    <td>
                      <button className="btn-delete" onClick={() => { setEmpleadoAEliminar(e); setMostrarModal(true); }}>
                        🗑️ Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="6" style={{ textAlign: "center" }}>No hay empleados registrados 😅</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </main>

      {mostrarModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>⚠️ ¿Eliminar empleado?</h3>
            <p>Estás a punto de eliminar a <b>{empleadoAEliminar.nombre_completo}</b>.</p>
            <div className="modal-buttons">
              <button onClick={eliminarEmpleadoConfirmado} className="confirmar">Sí, eliminar</button>
              <button onClick={() => setMostrarModal(false)} className="cancelar">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {mensaje.texto && (
        <div className={`mensaje-flotante ${mensaje.tipo}`}>{mensaje.texto}</div>
      )}
    </div>
  );
}