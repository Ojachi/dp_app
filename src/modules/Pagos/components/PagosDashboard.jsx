/**
 * Dashboard de Pagos - Métricas y estadísticas
 */
import React from 'react';

const PagosDashboard = ({ data, loading, onFiltersChange }) => {
  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p className="mt-2 text-muted">Cargando dashboard...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="alert alert-warning text-center">
        <i className="fas fa-exclamation-triangle me-2"></i>
        No se pudieron cargar los datos del dashboard
      </div>
    );
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const metricCards = [
    {
      title: 'Pagos Hoy',
      value: data.total_pagos_hoy,
      amount: data.monto_pagos_hoy,
      icon: 'fas fa-calendar-day',
      color: 'primary'
    },
    {
      title: 'Pagos del Mes',
      value: data.total_pagos_mes,
      amount: data.monto_pagos_mes,
      icon: 'fas fa-calendar-alt',
      color: 'success'
    },
    {
      title: 'Facturas Pendientes',
      value: data.facturas_pendientes,
      amount: data.monto_pendiente,
      icon: 'fas fa-clock',
      color: 'warning'
    }
  ];

  return (
    <div>
      {/* Métricas principales */}
      <div className="row g-3 mb-4">
        {metricCards.map((metric, index) => (
          <div key={index} className="col-md-4">
            <div className={`card border-start border-${metric.color} border-4`}>
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className={`bg-${metric.color} bg-opacity-10 rounded-circle p-3 me-3`}>
                    <i className={`${metric.icon} text-${metric.color} fs-4`}></i>
                  </div>
                  <div>
                    <h6 className="text-muted mb-1 fw-normal">{metric.title}</h6>
                    <div className="d-flex align-items-baseline">
                      <h4 className="mb-0 me-2">{metric.value}</h4>
                      <small className="text-muted">pagos</small>
                    </div>
                    <div className={`text-${metric.color} fw-medium`}>
                      {formatCurrency(metric.amount)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="row">
        {/* Gráfico de tendencias */}
        <div className="col-lg-8">
          <div className="card h-100">
            <div className="card-header">
              <h5 className="card-title mb-0">
                <i className="fas fa-chart-line me-2"></i>
                Tendencia Semanal de Pagos
              </h5>
            </div>
            <div className="card-body">
              <div className="row text-center">
                {data.tendencia_semanal?.map((item, index) => (
                  <div key={index} className="col">
                    <div className="border-end" style={{ height: '100px' }}>
                      <small className="text-muted d-block">{item.dia}</small>
                      <div 
                        className="bg-primary rounded mx-auto mb-2"
                        style={{ 
                          height: `${(item.pagos / 30) * 60}px`,
                          width: '20px',
                          minHeight: '10px'
                        }}
                      ></div>
                      <small className="fw-bold text-primary">{item.pagos}</small>
                      <br />
                      <small className="text-muted">
                        {formatCurrency(item.monto)}
                      </small>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Pagos por método */}
        <div className="col-lg-4">
          <div className="card h-100">
            <div className="card-header">
              <h5 className="card-title mb-0">
                <i className="fas fa-credit-card me-2"></i>
                Pagos por Método
              </h5>
            </div>
            <div className="card-body">
              {Object.entries(data.pagos_por_metodo || {}).map(([metodo, datos], index) => {
                const colors = ['primary', 'success', 'info', 'warning', 'secondary'];
                const color = colors[index % colors.length];
                const porcentaje = ((datos.cantidad / data.total_pagos_mes) * 100).toFixed(1);

                return (
                  <div key={metodo} className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span className="text-capitalize">{metodo}</span>
                      <small className="text-muted">{datos.cantidad} pagos</small>
                    </div>
                    <div className="progress mb-1" style={{ height: '8px' }}>
                      <div 
                        className={`progress-bar bg-${color}`}
                        style={{ width: `${porcentaje}%` }}
                      ></div>
                    </div>
                    <div className="d-flex justify-content-between">
                      <small className={`text-${color} fw-medium`}>{porcentaje}%</small>
                      <small className="text-muted">{formatCurrency(datos.monto)}</small>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Acciones rápidas */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">
                <i className="fas fa-bolt me-2"></i>
                Acciones Rápidas
              </h5>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-3">
                  <button 
                    className="btn btn-outline-primary w-100 py-3"
                    onClick={() => onFiltersChange({ fecha_desde: new Date().toISOString().split('T')[0] })}
                  >
                    <i className="fas fa-calendar-day d-block mb-2 fs-4"></i>
                    <span>Pagos de Hoy</span>
                  </button>
                </div>
                <div className="col-md-3">
                  <button 
                    className="btn btn-outline-success w-100 py-3"
                    onClick={() => {
                      const primerDiaDelMes = new Date();
                      primerDiaDelMes.setDate(1);
                      onFiltersChange({ fecha_desde: primerDiaDelMes.toISOString().split('T')[0] });
                    }}
                  >
                    <i className="fas fa-calendar-alt d-block mb-2 fs-4"></i>
                    <span>Pagos del Mes</span>
                  </button>
                </div>
                <div className="col-md-3">
                  <button 
                    className="btn btn-outline-warning w-100 py-3"
                    onClick={() => onFiltersChange({ estado: 'pendiente' })}
                  >
                    <i className="fas fa-clock d-block mb-2 fs-4"></i>
                    <span>Pagos Pendientes</span>
                  </button>
                </div>
                <div className="col-md-3">
                  <button 
                    className="btn btn-outline-info w-100 py-3"
                    onClick={() => onFiltersChange({ metodo_pago: 'efectivo' })}
                  >
                    <i className="fas fa-money-bill d-block mb-2 fs-4"></i>
                    <span>Pagos en Efectivo</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PagosDashboard;