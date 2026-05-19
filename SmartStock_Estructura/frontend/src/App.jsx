import { HashRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Inventory from "./pages/Inventory";
import Sale from "./pages/Sale";
import EmailConfirmado from "./pages/EmailConfirmado";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/email-confirmado" element={<EmailConfirmado />} />

        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/ventas" element={<Sale />} />
      </Routes>
    </Router>
  );
}

export default App;
