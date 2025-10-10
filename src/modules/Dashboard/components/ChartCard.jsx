/**
 * Componente de tarjeta con gráfico (placeholder por ahora)
 */
import React from 'react';

const ChartCard = ({ title, data, type = 'line', height = 300 }) => {
  return (
    <div className="card h-100">
      <div className="card-header">
        <h5 className="mb-0">
          <i className="fas fa-chart-line me-2"></i>
          {title}
        </h5>
      </div>
      <div className="card-body">
        <div 
          className="d-flex justify-content-center align-items-center text-muted"
          style={{ height: `${height}px` }}
        >
          <div className="text-center">
            <i className="fas fa-chart-bar fa-3x mb-3"></i>
            <p className="mb-0">
              Gráfico {type} - {title}
            </p>
            <small className="text-muted">
              Integración con recharts pendiente
            </small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartCard;