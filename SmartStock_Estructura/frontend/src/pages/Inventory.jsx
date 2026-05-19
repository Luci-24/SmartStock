import React, { useEffect, useState } from "react";
import "../styles/Inventory.css";
import { db } from "../supabase/firebaseCliente";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import "jspdf-autotable";

export default function Inventory() {
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [mensaje, setMensaje] = useState({ texto: "", tipo: "" });
  const [confirmarEliminacion, setConfirmarEliminacion] = useState(false);
  const [productoAEliminar, setProductoAEliminar] = useState(null);
  const [nuevoProducto, setNuevoProducto] = useState({
    nombre: "",
    precio: "",
    costo: "",
    cantidad: "",
    unidad: "",
  });
  const [usuarioNombre, setUsuarioNombre] = useState("");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("usuarioLogueado"));
    if (user) {
      setUsuarioNombre(user.nombre_completo || "Usuario");

      // ✅ Solo muestra bienvenida si viene directo del login
      const recienLogueado = localStorage.getItem("recienLogueado");
      if (recienLogueado === "true") {
        mostrarMensaje(`✅ Bienvenid@ ${user.nombre_completo}`, "success");
        localStorage.removeItem("recienLogueado"); // 🗑️ se borra para no repetir
      }

      obtenerProductos(user.id);
    } else {
      mostrarMensaje("⚠️ Debes iniciar sesión", "error");
    }
  }, []);

  function mostrarMensaje(texto, tipo = "info") {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje({ texto: "", tipo: "" }), 3000);
  }

  async function obtenerProductos(userId) {
    try {
      const q = query(collection(db, "inventario"), where("user_id", "==", userId));
      const snap = await getDocs(q);
      setProductos(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error("Error cargando productos:", err);
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setNuevoProducto({ ...nuevoProducto, [name]: value });
  }

  async function agregarProducto(e) {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem("usuarioLogueado"));
    if (!user) {
      mostrarMensaje("⚠️ Debes iniciar sesión para agregar productos", "error");
      return;
    }
    try {
      await addDoc(collection(db, "inventario"), {
        ...nuevoProducto,
        user_id: user.id,
        creado_en: serverTimestamp(),
      });
      mostrarMensaje("✅ Producto agregado con éxito", "success");
      setShowModal(false);
      setNuevoProducto({ nombre: "", precio: "", costo: "", cantidad: "", unidad: "" });
      obtenerProductos(user.id);
    } catch (err) {
      console.error(err);
      mostrarMensaje("❌ Error al agregar producto", "error");
    }
  }

  function pedirConfirmacionEliminar(id) {
    setProductoAEliminar(id);
    setConfirmarEliminacion(true);
  }

  async function confirmarEliminarProducto() {
    if (!productoAEliminar) return;
    try {
      await deleteDoc(doc(db, "inventario", productoAEliminar));
      mostrarMensaje("🗑️ Producto eliminado", "warning");
      const user = JSON.parse(localStorage.getItem("usuarioLogueado"));
      if (user) obtenerProductos(user.id);
    } catch (err) {
      mostrarMensaje("❌ Error al eliminar", "error");
    }
    setConfirmarEliminacion(false);
    setProductoAEliminar(null);
  }

  const totalReferencias = productos.length;
  const costoTotalInventario = productos.reduce((total, p) => total + (parseFloat(p.costo) || 0) * (parseFloat(p.cantidad) || 0), 0);
  const precioTotalInventario = productos.reduce((total, p) => total + (parseFloat(p.precio) || 0) * (parseFloat(p.cantidad) || 0), 0);
  const gananciaPotencial = precioTotalInventario - costoTotalInventario;

  const generarPDF = () => {
    const doc = new jsPDF();
    doc.setTextColor(90, 60, 200);
    doc.setFontSize(20);
    doc.text("SmartStock - Reporte de Inventario", 14, 20);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generado el ${new Date().toLocaleString("es-CO")}`, 14, 28);
    doc.text(`Usuario: ${usuarioNombre}`, 14, 35);
    doc.setDrawColor(90, 60, 200);
    doc.line(14, 38, 195, 38);
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text("Resumen general", 14, 50);
    doc.autoTable({
      startY: 54,
      head: [["Total referencias", "Costo total", "Ganancia potencial"]],
      body: [[totalReferencias, `$ ${costoTotalInventario.toLocaleString("es-CO")}`, `$ ${gananciaPotencial.toLocaleString("es-CO")}`]],
      theme: "grid",
      styles: { halign: "center", fontSize: 10 },
      headStyles: { fillColor: [90, 60, 200], textColor: 255 },
    });
    if (productos.length > 0) {
      doc.text("Detalle de productos", 14, doc.lastAutoTable.finalY + 15);
      doc.autoTable({
        startY: doc.lastAutoTable.finalY + 18,
        head: [["Producto", "Precio", "Costo", "Cantidad", "Unidad", "Ganancia"]],
        body: productos.map((p) => {
          const ganancia = ((parseFloat(p.precio) || 0) - (parseFloat(p.costo) || 0)) * (parseFloat(p.cantidad) || 0);
          return [p.nombre, `$ ${p.precio}`, `$ ${p.costo}`, p.cantidad, p.unidad || "-", `$ ${ganancia.toLocaleString("es-CO")}`];
        }),
        styles: { fontSize: 9 },
        headStyles: { fillColor: [60, 60, 60], textColor: 255 },
      });
    }
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text("SmartStock © 2025 - Sistema de Gestión de Inventarios", 14, pageHeight - 10);
    doc.save("Reporte_Inventario_SmartStock.pdf");
  };

  return (
    <div className="inventory-layout">
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
          <li className="active">📦 Inventario</li>
          <li onClick={() => navigate("/ventas")} style={{ cursor: "pointer" }}>💰 Vender</li>
          <li onClick={() => navigate("/movimientos")} style={{ cursor: "pointer" }}>📈 Movimientos</li>
          <li onClick={() => navigate("/empleados")} style={{ cursor: "pointer" }}>👥 Empleados</li>
          <li onClick={() => navigate("/configuracion")} style={{ cursor: "pointer" }}>⚙️ Configuración</li>
        </ul>
        <div className="sidebar-bottom">
          <p>➕ Agregar otro negocio</p>
          <p className="logout" onClick={() => { localStorage.removeItem("usuarioLogueado"); window.location.href = "/"; }}>
            🚪 Cerrar sesión
          </p>
        </div>
      </aside>

      <main className="inventory-main">
        <header className="inventory-header">
          <h1>Inventario</h1>
          <div className="header-actions">
            <button className="add-product-btn" onClick={() => setShowModal(true)}>+ Agregar producto</button>
          </div>
        </header>

        {usuarioNombre && <p className="saludo-usuario">👋 Hola, {usuarioNombre}</p>}

        <section className="inventory-summary">
          <div className="summary-box">
            <h3>{totalReferencias}</h3>
            <p>Total de referencias</p>
          </div>
          <div className="summary-box">
            <h3>{new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(costoTotalInventario)}</h3>
            <p>Costo total del inventario</p>
          </div>
          <div className="summary-box">
            <h3>{new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(gananciaPotencial)}</h3>
            <p>Ganancia potencial</p>
          </div>
        </section>

        <section className="inventory-table">
          <table>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Precio</th>
                <th>Costo</th>
                <th>Cantidad</th>
                <th>Unidad</th>
                <th>Ganancia</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productos.length > 0 ? (
                productos.map((p) => {
                  const ganancia = ((parseFloat(p.precio) || 0) - (parseFloat(p.costo) || 0)) * (parseFloat(p.cantidad) || 0);
                  return (
                    <tr key={p.id}>
                      <td>{p.nombre}</td>
                      <td>{new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(p.precio || 0)}</td>
                      <td>{new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(p.costo || 0)}</td>
                      <td>{p.cantidad}</td>
                      <td>{p.unidad}</td>
                      <td style={{ color: ganancia > 0 ? "green" : "red", fontWeight: "bold" }}>
                        {new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(ganancia)}
                      </td>
                      <td>
                        <button className="delete-btn" onClick={() => pedirConfirmacionEliminar(p.id)}>🗑️ Eliminar</button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr><td colSpan="7" style={{ textAlign: "center" }}>No hay productos aún 😅</td></tr>
              )}
            </tbody>
          </table>
        </section>
      </main>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Agregar producto</h2>
            <form onSubmit={agregarProducto}>
              <label>Nombre del producto*</label>
              <input type="text" name="nombre" value={nuevoProducto.nombre} onChange={handleChange} required />
              <label>Cantidad*</label>
              <input type="number" name="cantidad" value={nuevoProducto.cantidad} onChange={handleChange} required />
              <label>Costo*</label>
              <input type="number" name="costo" value={nuevoProducto.costo} onChange={handleChange} required />
              <label>Precio*</label>
              <input type="number" name="precio" value={nuevoProducto.precio} onChange={handleChange} required />
              <label>Unidad (opcional)</label>
              <input type="text" name="unidad" value={nuevoProducto.unidad} onChange={handleChange} />
              <button type="submit" className="save-btn">Crear producto</button>
              <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>Cancelar</button>
            </form>
          </div>
        </div>
      )}

      {confirmarEliminacion && (
        <div className="modal-overlay">
          <div className="modal-confirmacion">
            <div className="icono-alerta">⚠️</div>
            <h3>¿Eliminar producto?</h3>
            <p>Esta acción no se puede deshacer.</p>
            <div className="botones-confirmacion">
              <button className="confirmar" onClick={confirmarEliminarProducto}>Sí, eliminar</button>
              <button className="cancelar" onClick={() => setConfirmarEliminacion(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {mensaje.texto && (
        <div className={`mensaje-central ${mensaje.tipo}`}>
          <div className="mensaje-box">{mensaje.texto}</div>
        </div>
      )}
    </div>
  );
}