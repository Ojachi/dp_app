import React from 'react';
import { useCartera } from '../../hooks/useCartera';
import CuentasPorCobrar from './CuentasPorCobrar';


const CarteraView = () => {

  const cartera = useCartera();

  const renderContent = () => {
    return (
      <CuentasPorCobrar
        {...cartera}
      />
    );
  };

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