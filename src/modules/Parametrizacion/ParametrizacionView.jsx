import React, { useState } from 'react';
import { LoadingSpinner } from '../../components';
import PoblacionesAsignacionView from './components/PoblacionesAsignacionView';
import CuentasTab from './components/CuentasTab';
import ClientesSucursalesTab from './components/ClientesSucursalesTab';

const TABS = [
  { key: 'poblaciones', label: 'Poblaciones' },
  { key: 'cuentas', label: 'Cuentas de pago' },
  { key: 'clientes', label: 'Clientes y Sucursales' },
];

const ParametrizacionView = () => {
  const [active, setActive] = useState('poblaciones');

  const renderTab = () => {
    switch (active) {
      case 'poblaciones':
        return <PoblacionesAsignacionView />;
      case 'cuentas':
        return <CuentasTab />;
      case 'clientes':
        return <ClientesSucursalesTab />;
      default:
        return null;
    }
  };

  return (
    <div className="container-fluid py-3">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h4 className="mb-0">
          <i className="fas fa-sliders-h me-2" />
          Parametrización
        </h4>
      </div>

      <ul className="nav nav-tabs mb-3">
        {TABS.map(tab => (
          <li key={tab.key} className="nav-item">
            <button
              className={`nav-link ${active === tab.key ? 'active' : ''}`}
              onClick={() => setActive(tab.key)}
              type="button"
            >
              {tab.label}
            </button>
          </li>
        ))}
      </ul>

      <div className="card">
        <div className="card-body">
          {renderTab() || <LoadingSpinner message="Cargando..." />}
        </div>
      </div>
    </div>
  );
};

export default ParametrizacionView;
