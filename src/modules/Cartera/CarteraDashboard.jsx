import React from 'react';

const CarteraDashboard = ({ 
  resumen, 
  cuentasPorCobrar, 
  estadisticasMora, 
  metricas, 
  loading 
}) => {
  if (loading) {
    return (
      <div className="d-flex justify-content-center py-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando dashboard...</span>
        </div>
      </div>
    );
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value || 0);
  };

  return (
    <div className="row">
      {/* Métricas principales */}
      <div className="col-12 mb-4">
        <div className="row g-3">
          <div className="col-md-3">
            <div className="card bg-primary text-white h-100">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="card-title mb-1">Total Cartera</h6>
                    <h3 className="mb-0">{formatCurrency(resumen?.totalCartera)}</h3>
                  </div>
                  <div className="opacity-75">
                    <i className="fas fa-wallet fa-2x"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-3">
            <div className="card bg-warning text-white h-100">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="card-title mb-1">Por Cobrar</h6>
                    <h3 className="mb-0">{formatCurrency(resumen?.cuentasPorCobrar)}</h3>
                    <small className="opacity-75">
                      {resumen?.facturasPendientes} facturas
                    </small>
                  </div>
                  <div className="opacity-75">
                    <i className="fas fa-clock fa-2x"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-3">
            <div className="card bg-danger text-white h-100">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="card-title mb-1">En Mora</h6>
                    <h3 className="mb-0">{metricas?.cuentasEnMora || 0}</h3>
                    <small className="opacity-75">
                      {resumen?.porcentajeMora}% del total
                    </small>
                  </div>
                  <div className="opacity-75">
                    <i className="fas fa-exclamation-triangle fa-2x"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-3">
            <div className="card bg-info text-white h-100">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="card-title mb-1">Días Promedio</h6>
                    <h3 className="mb-0">{resumen?.diasPromedioCobranza}</h3>
                    <small className="opacity-75">días de cobranza</small>
                  </div>
                  <div className="opacity-75">
                    <i className="fas fa-calendar-day fa-2x"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Clientes con mayor deuda */}
      <div className="col-lg-8 mb-4">
        <div className="card h-100">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h5 className="mb-0">
              <i className="fas fa-users text-primary me-2"></i>
              Principales Cuentas por Cobrar
            </h5>
            <span className="badge bg-primary">{cuentasPorCobrar?.length || 0} clientes</span>
          </div>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Cliente</th>
                    <th>Deuda Total</th>
                    <th>Facturas</th>
                    <th>Estado</th>
                    <th>Días Vencido</th>
                  </tr>
                </thead>
                <tbody>
                  {cuentasPorCobrar?.slice(0, 5).map((cuenta, index) => (
                    <tr key={cuenta.id}>
                      <td>
                        <div>
                          <div className="fw-semibold">{cuenta.cliente}</div>
                          <small className="text-muted">{cuenta.ruc}</small>
                        </div>
                      </td>
                      <td>
                        <span className="fw-semibold">
                          {formatCurrency(cuenta.totalDeuda)}
                        </span>
                      </td>
                      <td>
                        <span className="badge bg-light text-dark">
                          {cuenta.facturasPendientes}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${
                          cuenta.estado === 'En mora' ? 'bg-danger' : 'bg-success'
                        }`}>
                          {cuenta.estado}
                        </span>
                      </td>
                      <td>
                        {cuenta.facturaVencida ? (
                          <span className="text-danger fw-semibold">
                            {cuenta.facturaVencida.diasVencido} días
                          </span>
                        ) : (
                          <span className="text-success">--</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Distribución de mora */}
      <div className="col-lg-4 mb-4">
        <div className="card h-100">
          <div className="card-header">
            <h5 className="mb-0">
              <i className="fas fa-chart-pie text-warning me-2"></i>
              Distribución de Mora
            </h5>
          </div>
          <div className="card-body">
            {estadisticasMora?.map((stat, index) => {
              const colors = ['primary', 'warning', 'danger', 'dark'];
              const color = colors[index] || 'secondary';
              
              return (
                <div key={index} className="mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="small fw-semibold">{stat.rango}</span>
                    <span className="small">{stat.porcentaje}%</span>
                  </div>
                  <div className="progress" style={{ height: '8px' }}>
                    <div 
                      className={`progress-bar bg-${color}`}
                      style={{ width: `${stat.porcentaje}%` }}
                    ></div>
                  </div>
                  <div className="d-flex justify-content-between mt-1">
                    <small className="text-muted">{stat.cantidad} clientes</small>
                    <small className="text-muted">{formatCurrency(stat.monto)}</small>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Alertas importantes */}
      <div className="col-12">
        <div className="card">
          <div className="card-header">
            <h5 className="mb-0">
              <i className="fas fa-bell text-danger me-2"></i>
              Alertas de Cobranza
            </h5>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-4">
                <div className="alert alert-danger d-flex align-items-center" role="alert">
                  <i className="fas fa-exclamation-circle me-2"></i>
                  <div>
                    <div className="fw-semibold">Facturas Vencidas</div>
                    <small>
                      {cuentasPorCobrar?.filter(c => c.facturaVencida).length || 0} clientes con facturas vencidas
                    </small>
                  </div>
                </div>
              </div>

              <div className="col-md-4">
                <div className="alert alert-warning d-flex align-items-center" role="alert">
                  <i className="fas fa-clock me-2"></i>
                  <div>
                    <div className="fw-semibold">Próximos a Vencer</div>
                    <small>Revisar facturas con vencimiento en 3 días</small>
                  </div>
                </div>
              </div>

              <div className="col-md-4">
                <div className="alert alert-info d-flex align-items-center" role="alert">
                  <i className="fas fa-chart-line me-2"></i>
                  <div>
                    <div className="fw-semibold">Límites de Crédito</div>
                    <small>2 clientes cerca del límite de crédito</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarteraDashboard;