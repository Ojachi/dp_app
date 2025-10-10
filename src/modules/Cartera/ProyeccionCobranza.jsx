import React from 'react';

const ProyeccionCobranza = ({ proyeccionCobranza, loading }) => {
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
          <span className="visually-hidden">Cargando proyección...</span>
        </div>
      </div>
    );
  }

  const totalProyectado = proyeccionCobranza?.reduce((sum, proj) => sum + proj.estimado, 0) || 0;
  const promedioProb = proyeccionCobranza?.length > 0 
    ? proyeccionCobranza.reduce((sum, proj) => sum + proj.probabilidad, 0) / proyeccionCobranza.length 
    : 0;

  return (
    <div className="row">
      {/* Resumen de proyección */}
      <div className="col-12 mb-4">
        <div className="card">
          <div className="card-header">
            <h5 className="mb-0">
              <i className="fas fa-chart-line text-info me-2"></i>
              Proyección de Cobranza - Próximos 4 Meses
            </h5>
          </div>
          <div className="card-body">
            <div className="row text-center">
              <div className="col-md-4">
                <div className="border-end">
                  <h3 className="text-primary">{formatCurrency(totalProyectado)}</h3>
                  <small className="text-muted">Total Proyectado</small>
                </div>
              </div>
              <div className="col-md-4">
                <div className="border-end">
                  <h3 className="text-success">{promedioProb.toFixed(0)}%</h3>
                  <small className="text-muted">Probabilidad Promedio</small>
                </div>
              </div>
              <div className="col-md-4">
                <h3 className="text-info">
                  {formatCurrency(totalProyectado * (promedioProb / 100))}
                </h3>
                <small className="text-muted">Cobranza Esperada</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico de barras de proyección */}
      <div className="col-lg-8 mb-4">
        <div className="card h-100">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h6 className="mb-0">Proyección Mensual</h6>
            <span className="badge bg-info">Estimaciones</span>
          </div>
          <div className="card-body">
            <div className="row">
              {proyeccionCobranza?.map((proyeccion, index) => {
                const maxMonto = Math.max(...proyeccionCobranza.map(p => p.estimado));
                const porcentajeAltura = (proyeccion.estimado / maxMonto) * 100;
                
                // Color basado en probabilidad
                let colorClass = 'success';
                if (proyeccion.probabilidad < 60) colorClass = 'danger';
                else if (proyeccion.probabilidad < 75) colorClass = 'warning';
                
                return (
                  <div key={index} className="col-3">
                    <div className="text-center mb-4">
                      {/* Barra de proyección */}
                      <div className="position-relative mb-3" style={{ height: '200px' }}>
                        <div className="d-flex flex-column justify-content-end h-100">
                          <div 
                            className={`bg-${colorClass} rounded-top position-relative`}
                            style={{ height: `${porcentajeAltura}%`, minHeight: '20px' }}
                          >
                            {/* Indicador de probabilidad */}
                            <div 
                              className="position-absolute top-0 start-0 w-100 bg-white bg-opacity-25"
                              style={{ height: `${100 - proyeccion.probabilidad}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        {/* Etiqueta de monto */}
                        <div className="position-absolute top-0 start-50 translate-middle-x">
                          <small className="badge bg-dark">
                            {formatCurrency(proyeccion.estimado)}
                          </small>
                        </div>
                      </div>
                      
                      {/* Información del mes */}
                      <div>
                        <div className="fw-semibold mb-1">{proyeccion.mes}</div>
                        <div className="small text-muted mb-1">
                          Probabilidad: {proyeccion.probabilidad}%
                        </div>
                        <div className={`small text-${colorClass} fw-semibold`}>
                          {formatCurrency(proyeccion.estimado * (proyeccion.probabilidad / 100))} esperado
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Leyenda */}
            <div className="border-top pt-3 mt-3">
              <div className="row text-center">
                <div className="col-4">
                  <div className="d-flex align-items-center justify-content-center">
                    <div className="bg-success rounded me-2" style={{ width: '12px', height: '12px' }}></div>
                    <small>Alta probabilidad (75%+)</small>
                  </div>
                </div>
                <div className="col-4">
                  <div className="d-flex align-items-center justify-content-center">
                    <div className="bg-warning rounded me-2" style={{ width: '12px', height: '12px' }}></div>
                    <small>Media probabilidad (60-74%)</small>
                  </div>
                </div>
                <div className="col-4">
                  <div className="d-flex align-items-center justify-content-center">
                    <div className="bg-danger rounded me-2" style={{ width: '12px', height: '12px' }}></div>
                    <small>Baja probabilidad (&lt;60%)</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detalles por mes */}
      <div className="col-lg-4 mb-4">
        <div className="card h-100">
          <div className="card-header">
            <h6 className="mb-0">Detalles por Mes</h6>
          </div>
          <div className="card-body">
            {proyeccionCobranza?.map((proyeccion, index) => {
              let colorClass = 'success';
              let iconClass = 'fas fa-arrow-up';
              
              if (proyeccion.probabilidad < 60) {
                colorClass = 'danger';
                iconClass = 'fas fa-arrow-down';
              } else if (proyeccion.probabilidad < 75) {
                colorClass = 'warning';
                iconClass = 'fas fa-arrow-right';
              }
              
              return (
                <div key={index} className="border rounded p-3 mb-3">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div className="fw-semibold">{proyeccion.mes}</div>
                    <span className={`badge bg-${colorClass}`}>
                      <i className={`${iconClass} me-1`}></i>
                      {proyeccion.probabilidad}%
                    </span>
                  </div>
                  
                  <div className="row text-center">
                    <div className="col-6">
                      <small className="text-muted d-block">Estimado</small>
                      <span className="fw-semibold">
                        {formatCurrency(proyeccion.estimado)}
                      </span>
                    </div>
                    <div className="col-6">
                      <small className="text-muted d-block">Esperado</small>
                      <span className={`fw-semibold text-${colorClass}`}>
                        {formatCurrency(proyeccion.estimado * (proyeccion.probabilidad / 100))}
                      </span>
                    </div>
                  </div>
                  
                  {proyeccion.real > 0 && (
                    <div className="mt-2 text-center">
                      <small className="text-muted d-block">Real</small>
                      <span className="fw-semibold text-info">
                        {formatCurrency(proyeccion.real)}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Factores que afectan la proyección */}
      <div className="col-12">
        <div className="card">
          <div className="card-header">
            <h6 className="mb-0">
              <i className="fas fa-info-circle text-info me-2"></i>
              Factores que Afectan la Proyección
            </h6>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-4">
                <div className="alert alert-info" role="alert">
                  <h6 className="alert-heading">
                    <i className="fas fa-calendar-check me-2"></i>
                    Factores Positivos
                  </h6>
                  <ul className="mb-0">
                    <li>Historial de pagos puntuales</li>
                    <li>Comunicación activa del cliente</li>
                    <li>Capacidad financiera demostrada</li>
                    <li>Relación comercial estable</li>
                  </ul>
                </div>
              </div>
              
              <div className="col-md-4">
                <div className="alert alert-warning" role="alert">
                  <h6 className="alert-heading">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    Factores de Riesgo
                  </h6>
                  <ul className="mb-0">
                    <li>Mora recurrente</li>
                    <li>Dificultades económicas sectoriales</li>
                    <li>Cambios en la dirección</li>
                    <li>Disputas comerciales</li>
                  </ul>
                </div>
              </div>
              
              <div className="col-md-4">
                <div className="alert alert-success" role="alert">
                  <h6 className="alert-heading">
                    <i className="fas fa-chart-line me-2"></i>
                    Estrategias de Mejora
                  </h6>
                  <ul className="mb-0">
                    <li>Seguimiento proactivo</li>
                    <li>Incentivos por pronto pago</li>
                    <li>Planes de pago flexibles</li>
                    <li>Comunicación regular</li>
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

export default ProyeccionCobranza;