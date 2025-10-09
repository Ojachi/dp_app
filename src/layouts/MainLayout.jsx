import React from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";

const MainLayout = ({ children }) => {
  return (
    <div className="d-flex flex-column vh-100">
      {/* 🔹 Header arriba */}
      <Header />

      {/* 🔹 Contenedor debajo del header */}
      <div className="d-flex flex-grow-1">
        {/* Sidebar a la izquierda */}
        <Sidebar />

        {/* Contenido a la derecha */}
        <main className="flex-grow-1 p-3 bg-light">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
