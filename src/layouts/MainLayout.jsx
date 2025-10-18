/**
 * Layout principal de la aplicación con sidebar colapsable
 */
import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import Header from "./Header";
import Sidebar from "./Sidebar";

const MainLayout = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    try {
      const saved = localStorage.getItem('sidebarOpen');
      return saved === null ? true : saved === 'true';
    } catch {
      return true;
    }
  });

  const toggleSidebar = () => {
    setSidebarOpen((prev) => {
      const next = !prev;
      try { localStorage.setItem('sidebarOpen', String(next)); } catch {}
      return next;
    });
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
    try { localStorage.setItem('sidebarOpen', 'false'); } catch {}
  };

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
      <Header onToggleSidebar={toggleSidebar} />

      {/* Contenedor debajo del header */}
      <div className="d-flex flex-grow-1">
        {/* Sidebar a la izquierda */}
        <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

        {/* Contenido a la derecha */}
        <main className="flex-grow-1 p-3 bg-light overflow-auto">
          {children}
        </main>
      </div>

      {/* Overlay para móviles cuando el sidebar está abierto */}
      {sidebarOpen && (
        <div
          className="d-lg-none position-fixed top-0 start-0 w-100 h-100"
          style={{ background: 'rgba(0,0,0,0.4)', zIndex: 1039 }}
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}
    </div>
  );
};

export default MainLayout;
