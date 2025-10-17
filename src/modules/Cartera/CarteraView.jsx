import React, { useState } from 'react';
import { useCartera } from '../../hooks/useCartera';
import CuentasPorCobrar from './CuentasPorCobrar';
import DetalleCliente from './DetalleCliente';

const CarteraView = () => {
  // MVP: Solo "Cuentas por Cobrar" y detalle por cliente
  const [activeTab, setActiveTab] = useState('lista');
  const [selectedClienteId, setSelectedClienteId] = useState(null);
  const cartera = useCartera();

  const handleVerDetalle = (clienteId) => {
    setSelectedClienteId(clienteId);
    setActiveTab('detalle');
    cartera.cargarDetalleCliente(clienteId);
  };

  const handleVolverListado = () => {
    setActiveTab('lista');
    cartera.limpiarDetalleCliente();
    setSelectedClienteId(null);
  };

  // No tabs in MVP; keep simple list/detail navigation

  const renderContent = () => {
    if (activeTab === 'detalle' && selectedClienteId) {
      return (
        <DetalleCliente
          {...cartera}
          clienteId={selectedClienteId}
          onVolver={handleVolverListado}
        />
      );
    }

    return (
      <CuentasPorCobrar
        {...cartera}
        onVerDetalle={handleVerDetalle}
      />
    );
  };

  // No tabs structure required in MVP

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="h3 mb-0">
          <i className="fas fa-wallet text-primary me-2"></i>
          Gestión de Cartera
        </h2>
      </div>

      {cartera.error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {cartera.error}
          <button
            type="button"
            className="btn-close"
            onClick={cartera.limpiarError}
          ></button>
        </div>
      )}

      {/* MVP: sin tabs; solo listado y detalle */}

      {renderContent()}
    </div>
  );
};

export default CarteraView;