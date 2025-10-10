/**
 * Componente de estadísticas rápidas de pagos
 */
import React from 'react';

const PagosStats = ({ stats, loading }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (number) => {
    return new Intl.NumberFormat('es-CO').format(number);
  };

  if (loading) {
    return (
      <div className="row g-3">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="col-md-3">
            <div className="card">
              <div className="card-body text-center">
                <div className="placeholder-glow">
                  <div className="placeholder col-6 bg-secondary rounded-circle mb-2" style={{ height: '40px' }}></div>
                  <div className="placeholder col-8"></div>
                  <div className="placeholder col-6"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const statsData = [
    {
      title: 'Pagos Hoy',
      value: stats?.total_pagos_hoy || 0,
      amount: stats?.monto_pagos_hoy || 0,
      icon: 'fas fa-calendar-day',
      color: 'primary',
      background: 'bg-primary bg-opacity-10'
    },
    {
      title: 'Pagos del Mes',
      value: stats?.total_pagos_mes || 0,
      amount: stats?.monto_pagos_mes || 0,
      icon: 'fas fa-calendar-alt',
      color: 'success',
      background: 'bg-success bg-opacity-10'
    },
    {
      title: 'Facturas Pendientes',
      value: stats?.facturas_pendientes || 0,
      amount: stats?.monto_pendiente || 0,
      icon: 'fas fa-clock',
      color: 'warning',
      background: 'bg-warning bg-opacity-10'
    },
    {
      title: 'Total Recaudado',
      value: stats?.total_recaudado || 0,
      amount: stats?.monto_total_recaudado || 0,
      icon: 'fas fa-chart-line',
      color: 'info',
      background: 'bg-info bg-opacity-10'
    }
  ];

  return (
    <div className="row g-3 mb-4">
      {statsData.map((stat, index) => (
        <div key={index} className="col-md-3">
          <div className="card h-100 border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className={`${stat.background} rounded-circle p-3 me-3`}>
                  <i className={`${stat.icon} text-${stat.color} fs-4`}></i>
                </div>
                <div className="flex-grow-1">
                  <h6 className="text-muted mb-1 fw-normal text-uppercase small">
                    {stat.title}
                  </h6>
                  <div className="d-flex align-items-baseline">
                    <h4 className={`mb-0 me-2 text-${stat.color} fw-bold`}>
                      {formatNumber(stat.value)}
                    </h4>
                    {stat.title !== 'Total Recaudado' && (
                      <small className="text-muted">pagos</small>
                    )}
                  </div>
                  <div className="small text-muted">
                    {formatCurrency(stat.amount)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PagosStats;