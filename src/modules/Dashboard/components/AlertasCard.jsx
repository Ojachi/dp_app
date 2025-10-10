/**
 * Componente de tarjeta de alertas para el dashboard
 */
import React from 'react';

const AlertasCard = ({ alertas, onViewAll }) => {
  const alertasNuevas = alertas?.nuevas || 0;
  const alertasCriticas = alertas?.criticas || 0;
  const alertasTotal = alertas?.total || 0;

  return (
    <div className="card h-100">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="mb-0">
          <i className="fas fa-bell me-2"></i>
          Centro de Alertas
        </h5>
        {alertasNuevas > 0 && (
          <span className="badge bg-danger">
            {alertasNuevas}
          </span>
        )}
      </div>
      <div className="card-body">
        {alertasTotal > 0 ? (
          <div>
            {/* Resumen de alertas */}
            <div className="row text-center mb-3">
              <div className="col-4">
                <div className="d-flex flex-column">
                  <span className="h5 text-danger mb-1">{alertasNuevas}</span>
                  <small className="text-muted">Nuevas</small>
                </div>
              </div>
              <div className="col-4">
                <div className="d-flex flex-column">
                  <span className="h5 text-warning mb-1">{alertasCriticas}</span>
                  <small className="text-muted">Críticas</small>
                </div>
              </div>
              <div className="col-4">
                <div className="d-flex flex-column">
                  <span className="h5 text-info mb-1">{alertasTotal}</span>
                  <small className="text-muted">Total</small>
                </div>
              </div>
            </div>

            {/* Tipos de alertas */}
            <div className="mb-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <small className="text-muted">Montos altos</small>
                <span className="badge bg-warning">2</span>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <small className="text-muted">Vencimientos</small>
                <span className="badge bg-danger">3</span>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <small className="text-muted">Pagos recibidos</small>
                <span className="badge bg-success">1</span>
              </div>
            </div>

            {/* Botón para ver todas */}
            <div className="d-grid">
              <button
                className="btn btn-outline-primary btn-sm"
                onClick={onViewAll}
              >
                <i className="fas fa-eye me-2"></i>
                Ver todas las alertas
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <i className="fas fa-check-circle fa-3x text-success mb-3"></i>
            <p className="text-muted mb-0">
              No hay alertas nuevas
            </p>
            <small className="text-muted">
              ¡Todo está bajo control!
            </small>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertasCard;