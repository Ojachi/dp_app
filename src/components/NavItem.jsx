/**
 * Componente de elemento de navegación
 */
import React from 'react';
import { NavLink } from 'react-router-dom';

const NavItem = ({ to, label, icon, badge }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `nav-link d-flex align-items-center justify-content-between px-3 py-2 text-decoration-none ${
          isActive ? 'bg-primary text-white' : 'text-light hover-bg-secondary'
        }`
      }
      style={{
        transition: 'all 0.2s ease',
        borderLeft: '3px solid transparent'
      }}
    >
      <div className="d-flex align-items-center">
        {icon && <i className={`${icon} me-2`} style={{ width: '16px' }}></i>}
        <span>{label}</span>
      </div>
      
      {badge && (
        <span className="badge bg-danger rounded-pill">
          {badge}
        </span>
      )}
    </NavLink>
  );
};

export default NavItem;
