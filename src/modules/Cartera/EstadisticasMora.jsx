import React from 'react';

const EstadisticasMora = ({ estadisticasMora, loading }) => {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value || 0);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center py-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando estadísticas...</span>
        </div>
      </div>
    );
  }

  const totalMonto = estadisticasMora?.reduce((sum, stat) => sum + stat.monto, 0) || 0;
  const totalCantidad = estadisticasMora?.reduce((sum, stat) => sum + stat.cantidad, 0) || 0;

  return (
    <div className="row">
      {/* Resumen general */}
      <div className="col-12 mb-4">
        <div className="card">
          <div className="card-header">
            <h5 className="mb-0">
              <i className="fas fa-chart-pie text-warning me-2"></i>
              Análisis Detallado de Mora
            </h5>
          </div>
          <div className="card-body">
            <div className="row text-center">
              <div className="col-md-4">
                <div className="border-end">
                  <h3 className="text-danger">{totalCantidad}</h3>
                  <small className="text-muted">Clientes en Mora</small>
                </div>
              </div>
              <div className="col-md-4">
                <div className="border-end">
                  <h3 className="text-warning">{formatCurrency(totalMonto)}</h3>
                  <small className="text-muted">Monto Total en Mora</small>
                </div>
              </div>
              <div className="col-md-4">
                <h3 className="text-info">
                  {totalMonto > 0 ? ((totalMonto / 2450000) * 100).toFixed(1) : 0}%
                </h3>
                <small className="text-muted">% del Total de Cartera</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Estadísticas por rango */}
      <div className="col-lg-8 mb-4">
        <div className="card h-100">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h6 className="mb-0">Distribución por Rangos de Mora</h6>
            <span className="badge bg-warning">Análisis de Vencimiento</span>
          </div>
          <div className="card-body">
            {estadisticasMora?.map((stat, index) => {
              const colors = [
                { bg: 'primary', border: 'primary' },
                { bg: 'warning', border: 'warning' },
                { bg: 'danger', border: 'danger' },
                { bg: 'dark', border: 'dark' }
              ];
              const color = colors[index] || { bg: 'secondary', border: 'secondary' };
              
              return (
                <div key={index} className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <div className="d-flex align-items-center">
                      <div 
                        className={`bg-${color.bg} rounded-circle me-3`}
                        style={{ width: '12px', height: '12px' }}
                      ></div>
                      <span className="fw-semibold">{stat.rango}</span>
                    </div>
                    <div className="text-end">
                      <span className="fw-semibold">{stat.porcentaje}%</span>
                    </div>
                  </div>
                  
                  <div className="progress mb-2" style={{ height: '20px' }}>
                    <div 
                      className={`progress-bar bg-${color.bg}`}
                      style={{ width: `${stat.porcentaje}%` }}
                    ></div>
                  </div>
                  
                  <div className="row text-center">
                    <div className="col-4">
                      <small className="text-muted d-block">Clientes</small>
                      <span className="fw-semibold">{stat.cantidad}</span>
                    </div>
                    <div className="col-4">
                      <small className="text-muted d-block">Monto</small>
                      <span className="fw-semibold">{formatCurrency(stat.monto)}</span>
                    </div>
                    <div className="col-4">
                      <small className="text-muted d-block">Promedio</small>
                      <span className="fw-semibold">
                        {stat.cantidad > 0 ? formatCurrency(stat.monto / stat.cantidad) : '$0'}
                      </span>
                    </div>
                  </div>
                  
                  {index < estadisticasMora.length - 1 && <hr className="mt-3" />}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Gráfico visual */}
      <div className="col-lg-4 mb-4">
        <div className="card h-100">
          <div className="card-header">
            <h6 className="mb-0">Representación Visual</h6>
          </div>
          <div className="card-body d-flex flex-column justify-content-center">
            {/* Gráfico de dona simulado */}
            <div className="text-center mb-4">
              <div className="position-relative d-inline-block">
                <svg width="200" height="200" viewBox="0 0 200 200">
                  <defs>
                    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="2" dy="2" stdDeviation="3" floodOpacity="0.3"/>
                    </filter>
                  </defs>
                  
                  {estadisticasMora?.map((stat, index) => {
                    const colors = ['#0d6efd', '#ffc107', '#dc3545', '#212529'];
                    const color = colors[index] || '#6c757d';
                    const startAngle = estadisticasMora.slice(0, index).reduce((sum, s) => sum + (s.porcentaje * 3.6), 0);
                    const endAngle = startAngle + (stat.porcentaje * 3.6);
                    
                    // Calcular path para el arco
                    const start = {
                      x: 100 + 70 * Math.cos((startAngle - 90) * Math.PI / 180),
                      y: 100 + 70 * Math.sin((startAngle - 90) * Math.PI / 180)
                    };
                    const end = {
                      x: 100 + 70 * Math.cos((endAngle - 90) * Math.PI / 180),
                      y: 100 + 70 * Math.sin((endAngle - 90) * Math.PI / 180)
                    };
                    
                    const largeArcFlag = stat.porcentaje > 50 ? 1 : 0;
                    
                    return (
                      <path
                        key={index}
                        d={`M 100 100 L ${start.x} ${start.y} A 70 70 0 ${largeArcFlag} 1 ${end.x} ${end.y} Z`}
                        fill={color}
                        filter="url(#shadow)"
                        className="hover-opacity"
                      />
                    );
                  })}
                  
                  {/* Círculo central */}
                  <circle cx="100" cy="100" r="30" fill="white" filter="url(#shadow)" />
                  <text x="100" y="95" textAnchor="middle" className="fw-bold" fontSize="12">MORA</text>
                  <text x="100" y="110" textAnchor="middle" fontSize="10" fill="#666">
                    {totalCantidad} clientes
                  </text>
                </svg>
              </div>
            </div>

            {/* Leyenda */}
            <div className="mt-auto">
              {estadisticasMora?.map((stat, index) => {
                const colors = ['primary', 'warning', 'danger', 'dark'];
                const color = colors[index] || 'secondary';
                
                return (
                  <div key={index} className="d-flex align-items-center mb-2">
                    <div 
                      className={`bg-${color} rounded-circle me-2`}
                      style={{ width: '10px', height: '10px' }}
                    ></div>
                    <small className="flex-grow-1">{stat.rango}</small>
                    <small className="fw-semibold">{stat.porcentaje}%</small>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Recomendaciones de gestión */}
      <div className="col-12">
        <div className="card">
          <div className="card-header">
            <h6 className="mb-0">
              <i className="fas fa-lightbulb text-warning me-2"></i>
              Recomendaciones de Gestión de Cobranza
            </h6>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-6">
                <div className="alert alert-danger" role="alert">
                  <h6 className="alert-heading">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    Acción Inmediata Requerida
                  </h6>
                  <p className="mb-2">
                    Clientes con mora mayor a 30 días requieren contacto urgente:
                  </p>
                  <ul className="mb-0">
                    <li>Llamada telefónica directa</li>
                    <li>Negociación de plan de pagos</li>
                    <li>Revisión de límites de crédito</li>
                  </ul>
                </div>
              </div>
              
              <div className="col-md-6">
                <div className="alert alert-warning" role="alert">
                  <h6 className="alert-heading">
                    <i className="fas fa-clock me-2"></i>
                    Seguimiento Preventivo
                  </h6>
                  <p className="mb-2">
                    Para clientes en mora de 1-30 días:
                  </p>
                  <ul className="mb-0">
                    <li>Envío automático de recordatorios</li>
                    <li>Confirmación de recepción de facturas</li>
                    <li>Verificación de datos de contacto</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EstadisticasMora;