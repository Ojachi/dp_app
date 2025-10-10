import React, { useState } from 'react';
import { useCartera } from '../../hooks/useCartera';
import CarteraDashboard from './CarteraDashboard';
import CuentasPorCobrar from './CuentasPorCobrar';
import EstadisticasMora from './EstadisticasMora';
import ProyeccionCobranza from './ProyeccionCobranza';
import DetalleCliente from './DetalleCliente';

const CarteraView = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedClienteId, setSelectedClienteId] = useState(null);
  const cartera = useCartera();

  const handleVerDetalle = (clienteId) => {
    setSelectedClienteId(clienteId);
    setActiveTab('detalle');
    cartera.cargarDetalleCliente(clienteId);
  };

  const handleVolverListado = () => {
    setActiveTab('cuentas');
    cartera.limpiarDetalleCliente();
    setSelectedClienteId(null);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <CarteraDashboard {...cartera} />;
      case 'cuentas':
        return <CuentasPorCobrar {...cartera} onVerDetalle={handleVerDetalle} />;
      case 'estadisticas':
        return <EstadisticasMora {...cartera} />;
      case 'proyeccion':
        return <ProyeccionCobranza {...cartera} />;
      case 'detalle':
        return (
          <DetalleCliente 
            {...cartera} 
            clienteId={selectedClienteId}
            onVolver={handleVolverListado}
          />
        );
      default:
        return <CarteraDashboard {...cartera} />;
    }
  };

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="h3 mb-0">
            <i className="fas fa-wallet text-primary me-2"></i>
            Gestión de Cartera
          </h2>
          <p className="text-muted mb-0">
            Análisis de cuentas por cobrar y gestión de cobranza
          </p>
        </div>
        
        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-primary"
            onClick={cartera.generarReporte}
            disabled={cartera.loading}
          >
            <i className="fas fa-file-pdf me-1"></i>
            Generar Reporte
          </button>
        </div>
      </div>

      {/* Navegación por pestañas */}
      {activeTab !== 'detalle' && (
        <ul className="nav nav-tabs mb-4">
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              <i className="fas fa-tachometer-alt me-1"></i>
              Dashboard
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'cuentas' ? 'active' : ''}`}
              onClick={() => setActiveTab('cuentas')}
            >
              <i className="fas fa-list me-1"></i>
              Cuentas por Cobrar
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'estadisticas' ? 'active' : ''}`}
              onClick={() => setActiveTab('estadisticas')}
            >
              <i className="fas fa-chart-pie me-1"></i>
              Estadísticas de Mora
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'proyeccion' ? 'active' : ''}`}
              onClick={() => setActiveTab('proyeccion')}
            >
              <i className="fas fa-chart-line me-1"></i>
              Proyección de Cobranza
            </button>
          </li>
        </ul>
      )}

      {/* Alertas de error */}
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

      {/* Indicador de carga global */}
      {cartera.loading && (
        <div className="d-flex justify-content-center py-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      )}

      {/* Contenido principal */}
      {!cartera.loading && renderContent()}
    </div>
  );
};

export default CarteraView;