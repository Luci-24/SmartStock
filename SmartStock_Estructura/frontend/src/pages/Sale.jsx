import React, { useEffect, useState } from "react";
import "../styles/Sale.css";
import { db } from "../supabase/firebaseCliente";
import {
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { useNavigate, useLocation } from "react-router-dom";
import jsPDF from "jspdf";

export default function Sale() {
  const navigate = useNavigate();
  const location = useLocation();
  const [usuarioNombre, setUsuarioNombre] = useState("");
  const [productos, setProductos] = useState([]);
  const [productosFiltrados, setProductosFiltrados] = useState([]);
  const [productoSeleccionadoId, setProductoSeleccionadoId] = useState("");
  const [cantidadVenta, setCantidadVenta] = useState(1);
  const [carrito, setCarrito] = useState([]);
  const [metodoPago, setMetodoPago] = useState("efectivo");
  const [cliente, setCliente] = useState("");
  const [mensaje, setMensaje] = useState({ texto: "", tipo: "" });
  const [modoVentaLibre, setModoVentaLibre] = useState(false);
  const [montoLibre, setMontoLibre] = useState("");
  const [modoGasto, setModoGasto] = useState(false);
  const [nombreGasto, setNombreGasto] = useState("");
  const [montoGasto, setMontoGasto] = useState("");
  const [detalleGasto, setDetalleGasto] = useState("");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("usuarioLogueado"));
    if (!user) {
      mostrarMensaje("⚠️ Debes iniciar sesión", "error");
      navigate("/");
      return;
    }
    setUsuarioNombre(user.nombre_completo || "Usuario");
    obtenerProductos(user.id);
  }, []);

  function mostrarMensaje(texto, tipo = "info") {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje({ texto: "", tipo: "" }), 2200);
  }

  async function obtenerProductos(userId) {
    try {
      const q = query(
        collection(db, "inventario"),
        where("user_id", "==", userId),
        orderBy("nombre", "asc")
      );
      const snap = await getDocs(q);
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setProductos(data);
      setProductosFiltrados(data);
    } catch (err) {
      console.error("Error cargando productos:", err);
     
    }
  }

  const productoSeleccionado =
    productosFiltrados.find((p) => String(p.id) === String(productoSeleccionadoId)) || null;

  function handleAgregarAlCarrito(e) {
    e.preventDefault();
    if (!productoSeleccionado) { mostrarMensaje("Selecciona un producto", "error"); return; }
    const cantidad = parseInt(cantidadVenta, 10) || 0;
    if (cantidad <= 0) { mostrarMensaje("Cantidad debe ser mayor a 0", "error"); return; }
    if (cantidad > (productoSeleccionado.cantidad || 0)) { mostrarMensaje("Cantidad mayor a disponible", "error"); return; }

    const existente = carrito.find((c) => String(c.productoId) === String(productoSeleccionado.id));
    if (existente) {
      setCarrito(carrito.map((c) => {
        if (String(c.productoId) === String(productoSeleccionado.id)) {
          const nuevaCantidad = c.cantidad + cantidad;
          return { ...c, cantidad: nuevaCantidad, subtotal: nuevaCantidad * (productoSeleccionado.precio || 0) };
        }
        return c;
      }));
    } else {
      setCarrito([...carrito, {
        productoId: productoSeleccionado.id,
        nombre: productoSeleccionado.nombre,
        precio: Number(productoSeleccionado.precio) || 0,
        cantidad,
        subtotal: cantidad * (Number(productoSeleccionado.precio) || 0),
      }]);
    }
    setCantidadVenta(1);
    mostrarMensaje("Producto agregado al carrito", "success");
  }

  function eliminarDelCarrito(productoId) {
    setCarrito(carrito.filter((c) => String(c.productoId) !== String(productoId)));
  }

  const totalVenta = modoVentaLibre
    ? Number(montoLibre) || 0
    : carrito.reduce((t, i) => t + (Number(i.subtotal) || 0), 0);

  function generarFacturaPDF(ventaId) {
    const doc = new jsPDF();
    const fecha = new Date().toLocaleDateString("es-CO");
    doc.setFontSize(16);
    doc.text("📄 FACTURA DE VENTA", 20, 20);
    doc.setFontSize(11);
    doc.text(`Fecha: ${fecha}`, 20, 30);
    doc.text(`Cliente: ${cliente || "Cliente general"}`, 20, 37);
    doc.text(`Método de pago: ${metodoPago}`, 20, 44);
    doc.text(`Número de venta: ${ventaId}`, 20, 51);
    let y = 65;
    doc.text("Producto", 20, y); doc.text("Cant.", 100, y);
    doc.text("Precio", 130, y); doc.text("Subtotal", 165, y);
    y += 5;
    carrito.forEach((item) => {
      doc.text(item.nombre, 20, y);
      doc.text(String(item.cantidad), 100, y);
      doc.text(`$${item.precio.toLocaleString()}`, 130, y);
      doc.text(`$${item.subtotal.toLocaleString()}`, 165, y);
      y += 6;
    });
    y += 8;
    doc.setFontSize(13);
    doc.text(`TOTAL: $${totalVenta.toLocaleString()}`, 130, y);
    y += 15;
    doc.setFontSize(10);
    doc.text("Gracias por su compra 💚", 20, y);
    doc.save(`Factura_${cliente || "venta"}_${fecha}.pdf`);
  }

  async function crearVenta() {
    if (!modoVentaLibre && carrito.length === 0) { mostrarMensaje("Agrega al menos un producto", "error"); return; }
    if (modoVentaLibre && (!montoLibre || isNaN(montoLibre) || montoLibre <= 0)) { mostrarMensaje("Monto inválido", "error"); return; }

    const user = JSON.parse(localStorage.getItem("usuarioLogueado"));
    if (!user?.id) { mostrarMensaje("Debes iniciar sesión", "error"); return; }

    try {
      // 1. Crear documento de venta
      const ventaRef = await addDoc(collection(db, "ventas"), {
        user_id: user.id,
        fecha: new Date().toISOString().split("T")[0],
        cliente: cliente || "Cliente general",
        metodo_pago: metodoPago,
        total: totalVenta,
        creado_en: serverTimestamp(),
      });

      // 2. Guardar detalles y actualizar stock
      if (!modoVentaLibre && carrito.length > 0) {
        for (const item of carrito) {
          // Guardar detalle
          await addDoc(collection(db, "detalle_ventas"), {
            venta_id: ventaRef.id,
            producto_id: item.productoId,
            nombre: item.nombre,
            cantidad: item.cantidad,
            precio_unitario: item.precio,
            subtotal: item.subtotal,
          });

          // Actualizar stock en inventario
          const prodSnap = await getDocs(
            query(collection(db, "inventario"), where("__name__", "==", item.productoId))
          );
          if (!prodSnap.empty) {
            const prodDoc = prodSnap.docs[0];
            const nuevaCantidad = (prodDoc.data().cantidad || 0) - item.cantidad;
            await updateDoc(doc(db, "inventario", item.productoId), { cantidad: nuevaCantidad });
          }
        }
      }

      generarFacturaPDF(ventaRef.id);
      mostrarMensaje("✅ Venta registrada correctamente", "success");
      setCarrito([]);
      setCliente("");
      setMontoLibre("");
      setModoVentaLibre(false);
      obtenerProductos(user.id);
    } catch (err) {
      console.error("Error al crear venta:", err);
      mostrarMensaje("❌ Error al crear la venta: " + err.message, "error");
    }
  }

  async function registrarGasto() {
    if (!nombreGasto || !montoGasto) { mostrarMensaje("Completa todos los campos", "error"); return; }
    try {
      await addDoc(collection(db, "gastos"), {
        descripcion: nombreGasto,
        monto: Number(montoGasto),
        metodo_pago: metodoPago,
        detalle: detalleGasto || "",
        creado_en: serverTimestamp(),
      });
      mostrarMensaje("✅ Gasto registrado correctamente", "success");
      setNombreGasto("");
      setMontoGasto("");
      setDetalleGasto("");
      setModoGasto(false);
    } catch (err) {
      console.error("Error al registrar gasto:", err);
      mostrarMensaje("❌ Error al guardar gasto: " + err.message, "error");
    }
  }

  function formatCOP(n) {
    return new Intl.NumberFormat("es-CO", {
      style: "currency", currency: "COP", minimumFractionDigits: 0,
    }).format(n || 0);
  }

  return (
    <div className="sale-layout">
      <aside className="sidebar">
        <div className="logo-container-sidebar">
          <div className="cube-inventory">
            <div className="face front"></div><div className="face back"></div>
            <div className="face right"></div><div className="face left"></div>
            <div className="face top"></div><div className="face bottom"></div>
          </div>
          <h2 className="sidebar-title">SmartStock</h2>
        </div>
        <ul className="menu">
          <li className={location.pathname === "/inventory" ? "active" : ""} onClick={() => navigate("/inventory")}>📦 Inventario</li>
          <li className={location.pathname === "/ventas" ? "active" : ""} onClick={() => navigate("/ventas")}>💰 Vender</li>
          <li className={location.pathname === "/movimientos" ? "active" : ""} onClick={() => navigate("/movimientos")}>📈 Movimientos</li>
          <li className={location.pathname === "/empleados" ? "active" : ""} onClick={() => navigate("/empleados")}>👥 Empleados</li>
          <li className={location.pathname === "/configuracion" ? "active" : ""} onClick={() => navigate("/configuracion")}>⚙️ Configuración</li>
        </ul>
        <div className="sidebar-bottom">
          <p>➕ Agregar otro negocio</p>
          <p className="logout" onClick={() => { localStorage.removeItem("usuarioLogueado"); window.location.href = "/"; }}>
            🚪 Cerrar sesión
          </p>
        </div>
      </aside>

      <main className="sale-main">
        <header className="sale-header">
          <h1>{modoGasto ? "Registrar Gasto" : "Registrar Venta"}</h1>
          {usuarioNombre && <p className="saludo-usuario">👋 Hola, {usuarioNombre}</p>}
        </header>

        <div className="sale-grid">
          <section className="sale-catalog">
            <div className="catalog-top">
              <input
                className="search"
                placeholder="Buscar producto..."
                onChange={(e) => {
                  const q = e.target.value.toLowerCase();
                  setProductosFiltrados(
                    q ? productos.filter((p) => p.nombre.toLowerCase().includes(q)) : productos
                  );
                }}
              />
              <div className="catalog-actions">
                <button className="btn-green" onClick={() => { setModoVentaLibre(true); setModoGasto(false); }}>
                  💸 Venta libre
                </button>
                <button className="btn-red" onClick={() => { setModoGasto(true); setModoVentaLibre(false); }}>
                  📉 Gasto
                </button>
              </div>
            </div>

            {!modoVentaLibre && !modoGasto && productosFiltrados.map((p) => (
              <div className="card product-card" key={p.id}
                onClick={() => { setProductoSeleccionadoId(p.id); setCantidadVenta(1); }}>
                <div className="product-price">{formatCOP(p.precio)}</div>
                <div className="product-name">{p.nombre}</div>
                <div className="product-stock">{p.cantidad} disponibles</div>
              </div>
            ))}
          </section>

          <aside className="sale-panel">
            <div className="panel-inner">
              {modoGasto ? (
                <>
                  <label>Nombre del gasto</label>
                  <input type="text" value={nombreGasto} onChange={(e) => setNombreGasto(e.target.value)} placeholder="Ej: Compra de materiales" />
                  <label>Monto</label>
                  <input type="number" value={montoGasto} onChange={(e) => setMontoGasto(e.target.value)} placeholder="Ej: 50000" />
                  <label>Método de pago</label>
                  <select value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)}>
                    <option value="efectivo">Efectivo</option>
                    <option value="nequi">Nequi</option>
                  </select>
                  <label>Detalle (opcional)</label>
                  <textarea value={detalleGasto} onChange={(e) => setDetalleGasto(e.target.value)} placeholder="Descripción breve del gasto" />
                  <button className="create-sale" onClick={registrarGasto}>💾 Guardar gasto</button>
                </>
              ) : (
                <>
                  <h3>Método de pago</h3>
                  <div className="payment-methods">
                    <button className={metodoPago === "efectivo" ? "method active" : "method"} onClick={() => setMetodoPago("efectivo")}>Efectivo</button>
                    <button className={metodoPago === "nequi" ? "method active" : "method"} onClick={() => setMetodoPago("nequi")}>Nequi</button>
                  </div>
                  <label>Cliente</label>
                  <input type="text" value={cliente} onChange={(e) => setCliente(e.target.value)} placeholder="Nombre del cliente" />

                  {modoVentaLibre && (
                    <>
                      <label>Monto</label>
                      <input type="number" value={montoLibre} onChange={(e) => setMontoLibre(e.target.value)} placeholder="Ej: 50000" />
                    </>
                  )}

                  {!modoVentaLibre && productoSeleccionado && (
                    <>
                      <label>Cantidad ({productoSeleccionado.nombre})</label>
                      <input type="number" min="1" max={productoSeleccionado.cantidad} value={cantidadVenta} onChange={(e) => setCantidadVenta(e.target.value)} />
                      <button className="btn-add" onClick={handleAgregarAlCarrito}>🛒 Agregar al carrito</button>
                    </>
                  )}

                  <hr />
                  {!modoVentaLibre && carrito.length > 0 && (
                    <div className="cart-list">
                      {carrito.map((c) => (
                        <div key={c.productoId} className="cart-item">
                          <strong>{c.nombre}</strong>
                          <span>{formatCOP(c.subtotal)}</span>
                          <button className="delete-btn" onClick={() => eliminarDelCarrito(c.productoId)}>❌</button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="total-row">
                    <div>Total</div>
                    <div className="total-amount">{formatCOP(totalVenta)}</div>
                  </div>
                  <button className="create-sale" onClick={crearVenta}>💰 Crear venta</button>
                </>
              )}
            </div>
          </aside>
        </div>
      </main>

      {mensaje.texto && (
        <div className={`mensaje-central ${mensaje.tipo}`}>
          <div className="mensaje-box">{mensaje.texto}</div>
        </div>
      )}
    </div>
  );
}