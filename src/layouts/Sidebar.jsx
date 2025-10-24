/**
 * Sidebar con navegación filtrada por roles
 */
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useAlertas } from '../hooks/useAlertas';
import NavItem from '../components/NavItem';
import { USER_ROLES } from '../utils/constants';
import { FEATURE_FLAGS } from '../config/featureFlags';

const Sidebar = ({ isOpen = true, onClose }) => {
  const { hasRole } = useAuth();
  const { contadorNuevas = 0 } = useAlertas({ autoLoad: FEATURE_FLAGS.alertas });

  // Footer removido para evitar duplicar información del usuario (se muestra en el header)

  // Definir elementos de navegación con permisos
  const navItems = [
    // Dashboard eliminado del menú lateral: no se usa en la app
    {
      to: '/facturas',
      label: 'Facturas',
      icon: 'fas fa-file-invoice',
      roles: [USER_ROLES.GERENTE, USER_ROLES.VENDEDOR, USER_ROLES.DISTRIBUIDOR]
    },
    {
      to: '/pagos',
      label: 'Pagos',
      icon: 'fas fa-money-bill-wave',
      roles: [USER_ROLES.GERENTE, USER_ROLES.VENDEDOR, USER_ROLES.DISTRIBUIDOR]
    },
    FEATURE_FLAGS.alertas && {
      to: '/alertas',
      label: 'Alertas',
      icon: 'fas fa-bell',
      roles: [USER_ROLES.GERENTE, USER_ROLES.VENDEDOR],
      badge: contadorNuevas > 0 ? contadorNuevas : null
    },
    FEATURE_FLAGS.cartera && {
      to: '/cartera',
      label: 'Cartera',
      icon: 'fas fa-chart-pie',
      roles: [USER_ROLES.GERENTE]
    },
    FEATURE_FLAGS.usuarios && {
      to: '/usuarios',
      label: 'Usuarios',
      icon: 'fas fa-users',
      roles: [USER_ROLES.GERENTE]
    },
    FEATURE_FLAGS.parametrizacion && {
      to: '/parametrizacion',
      label: 'Parametrización',
      icon: 'fas fa-cogs',
      roles: [USER_ROLES.GERENTE]
    },
    FEATURE_FLAGS.importacion && {
      to: '/importacion',
      label: 'Importar Excel',
      icon: 'fas fa-file-upload',
      roles: [USER_ROLES.GERENTE]
    }
  ];

  // Filtrar elementos según el rol del usuario
  const filteredNavItems = navItems
    .filter(Boolean)
    .filter(item => !item.roles || hasRole(item.roles));

  // Sidebar unfoldable en desktop (solo íconos) y offcanvas en móvil (.show controla móvil)
  return (
    <div className={`sidebar bg-dark text-white d-flex flex-column unfoldable ${isOpen ? 'show' : ''}`}>
      {/* Header del sidebar */}
      <div className="sidebar-header p-3 border-bottom border-secondary d-flex align-items-center justify-content-between">
        <h6 className="mb-0 d-flex align-items-center">
          <i className="fas fa-compass me-2"></i>
          <span className="sidebar-title-text">Navegación</span>
        </h6>
        <button
          className="btn btn-outline-light btn-sm d-lg-none"
          onClick={onClose}
          aria-label="Close sidebar"
        >
          <i className="fas fa-times"></i>
        </button>
      </div>

      {/* Navegación principal */}
      <nav className="flex-grow-1 py-3">
        {filteredNavItems.map((item) => (
          <NavItem key={item.label} {...item} />
        ))}
      </nav>

    </div>
  );
};

export default Sidebar;
