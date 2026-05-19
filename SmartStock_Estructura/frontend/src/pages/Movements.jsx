import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { db } from "../supabase/firebaseCliente";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import "../styles/Movements.css";

export default function Movements() {
  const navigate = useNavigate();
  const location = useLocation();
  const [movimientos, setMovimientos] = useState([]);
  const [usuarioNombre, setUsuarioNombre] = useState("");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("usuarioLogueado"));
    if (user) {
      setUsuarioNombre(user.nombre_completo || "Usuario");
      obtenerMovimientos(user.id);
    } else {
      console.warn("⚠️ No hay usuario logueado");
    }
  }, []);

  async function obtenerMovimientos(userId) {
    try {
      // ── Ventas ──────────────────────────────────────────────
      const qVentas = query(
        collection(db, "ventas"),
        where("user_id", "==", userId),
        orderBy("fecha", "desc")
      );
      const snapVentas = await getDocs(qVentas);
      const ventas = snapVentas.docs.map((d) => {
        const v = d.data();
        return {
          id: `V-${d.id}`,
          tipo: "Venta",
          concepto: v.cliente || "Venta realizada",
          monto: parseFloat(v.total) || 0,
          metodo_pago: v.metodo_pago || "Desconocido",
          fecha: v.fecha || v.creado_en,
        };
      });

      // ── Gastos ──────────────────────────────────────────────
      const qGastos = query(
        collection(db, "gastos"),
        orderBy("creado_en", "desc")
      );
      const snapGastos = await getDocs(qGastos);
      const gastos = snapGastos.docs.map((d) => {
        const g = d.data();
        return {
          id: `G-${d.id}`,
          tipo: "Gasto",
          concepto: g.descripcion || "Gasto registrado",
          monto: parseFloat(g.monto) || 0,
          metodo_pago: g.metodo_pago || "Desconocido",
          fecha: g.creado_en,
        };
      });

      const movs = [...ventas, ...gastos].sort(
        (a, b) => new Date(b.fecha) - new Date(a.fecha)
      );
      setMovimientos(movs);
    } catch (err) {
      console.error("❌ Error cargando movimientos:", err);
    }
  }

  // ── Cálculos ────────────────────────────────────────────────
  const totalVentas = movimientos
    .filter((m) => m.tipo === "Venta")
    .reduce((acc, m) => acc + m.monto, 0);

  const totalGastos = movimientos
    .filter((m) => m.tipo === "Gasto")
    .reduce((acc, m) => acc + m.monto, 0);

  const balance = totalVentas - totalGastos;

  const movimientosPorMes = movimientos.reduce((acc, mov) => {
    const mes = new Date(mov.fecha).toLocaleString("es-CO", { month: "short" });
    if (!acc[mes]) acc[mes] = { ventas: 0, gastos: 0 };
    if (mov.tipo === "Venta") acc[mes].ventas += mov.monto;
    else acc[mes].gastos += mov.monto;
    return acc;
  }, {});

  const dataPorMes = Object.entries(movimientosPorMes).map(([mes, v]) => ({
    mes, ventas: v.ventas, gastos: v.gastos,
  }));

  const ventasPorMetodo = movimientos
    .filter((m) => m.tipo === "Venta")
    .reduce((acc, m) => {
      acc[m.metodo_pago] = (acc[m.metodo_pago] || 0) + m.monto;
      return acc;
    }, {});

  const dataMetodosPago = Object.entries(ventasPorMetodo).map(([metodo, total]) => ({
    metodo, total,
  }));

  // ── PDF ─────────────────────────────────────────────────────
  const downloadPDF = () => {
    try {
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      doc.setFontSize(16);
      doc.text("📊 Reporte de Movimientos - SmartStock", 14, 20);
      doc.setFontSize(11);
      doc.text(`Usuario: ${usuarioNombre}`, 14, 28);
      doc.text(`Fecha de reporte: ${new Date().toLocaleDateString()}`, 14, 34);
      doc.setFontSize(12);
      doc.text("Resumen general:", 14, 44);
      doc.setFontSize(11);
      doc.text(`💰 Ventas Totales: $${totalVentas.toLocaleString("es-CO")}`, 14, 52);
      doc.text(`💸 Gastos Totales: $${totalGastos.toLocaleString("es-CO")}`, 14, 59);
      doc.text(`📈 Balance: $${balance.toLocaleString("es-CO")}`, 14, 66);
      autoTable(doc, {
        startY: 75,
        head: [["Tipo", "Concepto", "Valor", "Medio de pago", "Fecha"]],
        body: movimientos.map((m) => [
          m.tipo,
          m.concepto,
          `$${m.monto.toLocaleString("es-CO")}`,
          m.metodo_pago,
          new Date(m.fecha).toLocaleString("es-CO"),
        ]),
        theme: "grid",
        headStyles: { fillColor: [25, 118, 210], textColor: 255 },
        alternateRowStyles: { fillColor: [240, 240, 240] },
        styles: { fontSize: 9 },
      });
      doc.save("reporte_movimientos.pdf");
    } catch (error) {
      console.error("❌ Error generando PDF:", error);
    }
  };

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

      <main className="movements-main">
        <div className="movements-header">
          <h1>Movimientos</h1>
          <button className="btn-download" onClick={downloadPDF}>⬇️ Descargar reporte</button>
        </div>

        <p className="saludo-usuario">👋 Hola, {usuarioNombre}</p>

        <div className="summary-cards">
          <div className="card-summary balance">
            <p>Balance</p>
            <h3>${balance.toLocaleString("es-CO")}</h3>
          </div>
          <div className="card-summary ventas">
            <p>Ventas Totales</p>
            <h3>${totalVentas.toLocaleString("es-CO")}</h3>
          </div>
          <div className="card-summary gastos">
            <p>Gastos Totales</p>
            <h3>${totalGastos.toLocaleString("es-CO")}</h3>
          </div>
        </div>

        <div className="charts-section">
          <h2>📊 Reportes visuales</h2>
          <div className="charts-container">
            <div className="chart-box">
              <h3>Ventas y Gastos por mes</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dataPorMes}>
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="ventas" fill="#1976d2" name="Ventas ($)" />
                  <Bar dataKey="gastos" fill="#ef5350" name="Gastos ($)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="chart-box">
              <h3>Ventas por método de pago</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={dataMetodosPago} dataKey="total" nameKey="metodo" outerRadius={100} label>
                    {dataMetodosPago.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={["#1976d2", "#2e7d32", "#ef6c00", "#9c27b0"][index % 4]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="movements-table">
          <h2>Transacciones</h2>
          <table>
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Concepto</th>
                <th>Valor</th>
                <th>Medio de pago</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {movimientos.length > 0 ? (
                movimientos.map((m) => (
                  <tr key={m.id}>
                    <td className={m.tipo === "Venta" ? "tipo-venta" : "tipo-gasto"}>{m.tipo}</td>
                    <td>{m.concepto}</td>
                    <td>${m.monto.toLocaleString("es-CO")}</td>
                    <td>{m.metodo_pago}</td>
                    <td>{new Date(m.fecha).toLocaleString("es-CO")}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="5" style={{ textAlign: "center" }}>No hay movimientos registrados 😅</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}