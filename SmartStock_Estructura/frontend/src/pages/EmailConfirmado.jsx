import React from "react";

export default function EmailConfirmado() {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh"
    }}>
      <h1>✅ Correo confirmado</h1>
      <p>Tu correo ha sido verificado exitosamente.</p>

      <a href="/" style={{
        marginTop: "20px",
        background: "#4f46e5",
        padding: "10px 20px",
        borderRadius: "10px",
        color: "white",
        textDecoration: "none"
      }}>
        Ir al inicio
      </a>
    </div>
  );
}
