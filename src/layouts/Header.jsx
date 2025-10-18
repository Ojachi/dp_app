/**
 * Header de la aplicación con información del usuario y alertas
 */
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAlertas } from '../hooks/useAlertas';
import { useNavigate } from 'react-router-dom';
import { USER_ROLES } from '../utils/constants';

const Header = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const { contadorNuevas } = useAlertas();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getRoleBadge = (role) => {
    const badges = {
      [USER_ROLES.GERENTE]: { text: 'Gerente', class: 'bg-success' },
      [USER_ROLES.VENDEDOR]: { text: 'Vendedor', class: 'bg-primary' },
      [USER_ROLES.DISTRIBUIDOR]: { text: 'Distribuidor', class: 'bg-info' }
    };
    return badges[role] || { text: role, class: 'bg-secondary' };
  };

  const roleBadge = getRoleBadge(user?.roles);

  const displayName = `${user?.first_name || ''} ${user?.last_name || ''}`.trim();
  const displayEmail = user?.email || '';

  return (
    <header className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top shadow-sm">
  <div className="container-fluid">
        {/* Brand + hamburger */}
        <div className="d-flex align-items-center">
          <button
            className="btn btn-outline-light me-2 d-lg-none"
            type="button"
            aria-label="Toggle sidebar"
            onClick={onToggleSidebar}
          >
            <i className="fas fa-bars"></i>
          </button>
          <span className="navbar-brand mb-0 h1 d-flex align-items-center">
            <i className="fas fa-file-invoice-dollar me-2"></i>
            Distribuciones Perdomo
          </span>
        </div>

        {/* Navegación derecha */}
        <div className="navbar-nav ms-auto d-flex flex-row align-items-center">
          {/* Contador de alertas */}
          <button 
            className="btn btn-outline-light position-relative me-3"
            onClick={() => navigate('/alertas')}
            title="Ver alertas"
          >
            <i className="fas fa-bell"></i>
            {contadorNuevas > 0 && (
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                {contadorNuevas}
              </span>
            )}
          </button>

          {/* Información del usuario */}
          <div className="dropdown">
            <button 
              className="btn btn-outline-light dropdown-toggle d-flex align-items-center"
              type="button"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <i className="fas fa-user-circle me-2"></i>
              <div className="d-flex flex-column align-items-start">
                <small className="text-white">{user?.first_name || user?.username}</small>
                <span className={`badge ${roleBadge.class} badge-sm`}>
                  {roleBadge.text}
                </span>
              </div>
            </button>
            
            {showUserMenu && (
              <ul
                className="dropdown-menu dropdown-menu-end show"
                style={{ right: 0, left: 'auto', maxWidth: 'min(320px, calc(100vw - 16px))' }}
              >
                <li>
                  <div className="dropdown-item-text">
                    <div className="fw-semibold">{displayName}</div>
                    <div className="small text-secondary">{roleBadge.text}</div>
                    {displayEmail && (
                      <div className="small text-muted">{displayEmail}</div>
                    )}
                  </div>
                </li>
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <button 
                    className="dropdown-item"
                    onClick={() => navigate('/dashboard')}
                  >
                    <i className="fas fa-tachometer-alt me-2"></i>
                    Dashboard
                  </button>
                </li>
                <li>
                  <button 
                    className="dropdown-item"
                    onClick={() => navigate('/alertas')}
                  >
                    <i className="fas fa-bell me-2"></i>
                    Alertas {contadorNuevas > 0 && `(${contadorNuevas})`}
                  </button>
                </li>
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <button 
                    className="dropdown-item text-danger"
                    onClick={handleLogout}
                  >
                    <i className="fas fa-sign-out-alt me-2"></i>
                    Cerrar Sesión
                  </button>
                </li>
              </ul>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
