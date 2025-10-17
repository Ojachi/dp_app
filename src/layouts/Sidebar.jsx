/**
 * Sidebar con navegación filtrada por roles
 */
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useAlertas } from '../hooks/useAlertas';
import NavItem from '../components/NavItem';
import { USER_ROLES } from '../utils/constants';
import { FEATURE_FLAGS } from '../config/featureFlags';

const Sidebar = () => {
  const { user, hasRole } = useAuth();
  const { contadorNuevas = 0 } = useAlertas({ autoLoad: FEATURE_FLAGS.alertas });

  // Definir elementos de navegación con permisos
  const navItems = [
    FEATURE_FLAGS.dashboard && {
      to: '/dashboard',
      label: 'Dashboard',
      icon: 'fas fa-tachometer-alt',
      roles: [USER_ROLES.GERENTE, USER_ROLES.VENDEDOR, USER_ROLES.DISTRIBUIDOR]
    },
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
      roles: [USER_ROLES.GERENTE, USER_ROLES.VENDEDOR, USER_ROLES.DISTRIBUIDOR],
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

  return (
    <div className="sidebar bg-dark text-white d-flex flex-column" style={{ width: '250px', minHeight: '100%' }}>
      {/* Header del sidebar */}
      <div className="sidebar-header p-3 border-bottom border-secondary">
        <h6 className="mb-0 text-center">
          <i className="fas fa-bars me-2"></i>
          Navegación
        </h6>
      </div>

      {/* Navegación principal */}
      <nav className="flex-grow-1 py-3">
        {filteredNavItems.map((item) => (
          <NavItem key={item.label} {...item} />
        ))}
      </nav>

      {/* Footer del sidebar */}
      <div className="sidebar-footer p-3 border-top border-secondary">
        <div className="text-center">
          <small className="text-muted d-block">
            {user?.first_name || user?.full_name || user?.email}
          </small>
          <small className="text-muted">
            {user?.is_gerente ? 'Gerente' : 
             user?.is_vendedor ? 'Vendedor' : 
             user?.is_distribuidor ? 'Distribuidor' : 'Usuario'}
          </small>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
