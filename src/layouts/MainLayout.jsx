/**
 * Layout principal de la aplicación
 */
import React from "react";
import { useAuth } from "../context/AuthContext";
import Header from "./Header";
import Sidebar from "./Sidebar";

const MainLayout = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  // Si está cargando, mostrar spinner
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  // Si no está autenticado, solo mostrar el contenido (login)
  if (!isAuthenticated) {
    return children;
  }

  // Si está autenticado, mostrar el layout completo
  return (
    <div className="d-flex flex-column vh-100">
      {/* Header arriba */}
      <Header />

      {/* Contenedor debajo del header */}
      <div className="d-flex flex-grow-1">
        {/* Sidebar a la izquierda */}
        <Sidebar />

        {/* Contenido a la derecha */}
        <main className="flex-grow-1 p-3 bg-light overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
