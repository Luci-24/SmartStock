import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// 📄 Páginas
import Login from "./pages/Login";
import Register from "./pages/Register";
import Inventory from "./pages/Inventory";
import Sale from "./pages/Sale";
import Movements from "./pages/Movements";
import Employees from "./pages/Employees";
import Settings from "./pages/Settings";
import EmailConfirmado from "./pages/EmailConfirmado"; // ⬅️ AGREGADO

// 🎨 Estilos globales
import "./styles/variables.css";
import "./styles/App.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>

        {/* 🔐 Autenticación */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/email-confirmado" element={<EmailConfirmado />} /> {/* ⬅️ AGREGADO */}

        {/* 📦 Secciones principales */}
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/ventas" element={<Sale />} />
        <Route path="/movimientos" element={<Movements />} />
        <Route path="/empleados" element={<Employees />} />

        {/* ⚙️ Configuración */}
        <Route path="/configuracion" element={<Settings />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
