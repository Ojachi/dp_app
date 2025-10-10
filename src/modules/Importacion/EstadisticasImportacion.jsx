import React from 'react';

const EstadisticasImportacion = ({ estadisticas, loading }) => {
  const formatDuration = (milliseconds) => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${seconds}s`;
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

  if (!estadisticas) {
    return (
      <div className="alert alert-info" role="alert">
        <i className="fas fa-info-circle me-2"></i>
        No hay estadísticas disponibles en este momento.
      </div>
    );
  }

  const tasaExitoGeneral = estadisticas.totalRegistrosProcesados > 0 
    ? ((estadisticas.totalRegistrosExitosos / estadisticas.totalRegistrosProcesados) * 100).toFixed(1)
    : 0;

  return (
    <div className="row">
      {/* Métricas principales */}
      <div className="col-12 mb-4">
        <div className="card">
          <div className="card-header">
            <h5 className="mb-0">
              <i className="fas fa-chart-bar text-primary me-2"></i>
              Estadísticas Generales de Importación
            </h5>
          </div>
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-3">
                <div className="card bg-primary text-white h-100">
                  <div className="card-body text-center">
                    <i className="fas fa-upload fa-2x mb-2 opacity-75"></i>
                    <h3 className="mb-1">{estadisticas.totalImportaciones}</h3>
                    <small>Total Importaciones</small>
                  </div>
                </div>
              </div>
              
              <div className="col-md-3">
                <div className="card bg-success text-white h-100">
                  <div className="card-body text-center">
                    <i className="fas fa-check-circle fa-2x mb-2 opacity-75"></i>
                    <h3 className="mb-1">{estadisticas.importacionesExitosas}</h3>
                    <small>Exitosas</small>
                    <div className="mt-1">
                      <small className="opacity-75">
                        {estadisticas.totalImportaciones > 0 
                          ? ((estadisticas.importacionesExitosas / estadisticas.totalImportaciones) * 100).toFixed(1)
                          : 0}% del total
                      </small>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-3">
                <div className="card bg-warning text-white h-100">
                  <div className="card-body text-center">
                    <i className="fas fa-exclamation-triangle fa-2x mb-2 opacity-75"></i>
                    <h3 className="mb-1">{estadisticas.importacionesConErrores}</h3>
                    <small>Con Errores</small>
                    <div className="mt-1">
                      <small className="opacity-75">
                        {estadisticas.totalImportaciones > 0 
                          ? ((estadisticas.importacionesConErrores / estadisticas.totalImportaciones) * 100).toFixed(1)
                          : 0}% del total
                      </small>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-3">
                <div className="card bg-danger text-white h-100">
                  <div className="card-body text-center">
                    <i className="fas fa-times-circle fa-2x mb-2 opacity-75"></i>
                    <h3 className="mb-1">{estadisticas.importacionesFallidas}</h3>
                    <small>Fallidas</small>
                    <div className="mt-1">
                      <small className="opacity-75">
                        {estadisticas.totalImportaciones > 0 
                          ? ((estadisticas.importacionesFallidas / estadisticas.totalImportaciones) * 100).toFixed(1)
                          : 0}% del total
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Métricas de rendimiento */}
      <div className="col-lg-8 mb-4">
        <div className="card h-100">
          <div className="card-header">
            <h6 className="mb-0">
              <i className="fas fa-tachometer-alt text-info me-2"></i>
              Métricas de Rendimiento
            </h6>
          </div>
          <div className="card-body">
            <div className="row mb-4">
              <div className="col-md-4 text-center">
                <div className="mb-3">
                  <i className="fas fa-database fa-2x text-primary mb-2"></i>
                  <h4 className="mb-1">{estadisticas.totalRegistrosProcesados.toLocaleString()}</h4>
                  <small className="text-muted">Total Registros Procesados</small>
                </div>
              </div>
              <div className="col-md-4 text-center">
                <div className="mb-3">
                  <i className="fas fa-check fa-2x text-success mb-2"></i>
                  <h4 className="mb-1">{estadisticas.totalRegistrosExitosos.toLocaleString()}</h4>
                  <small className="text-muted">Registros Exitosos</small>
                </div>
              </div>
              <div className="col-md-4 text-center">
                <div className="mb-3">
                  <i className="fas fa-clock fa-2x text-warning mb-2"></i>
                  <h4 className="mb-1">{formatDuration(estadisticas.promedioTiempoProcesamiento)}</h4>
                  <small className="text-muted">Tiempo Promedio</small>
                </div>
              </div>
            </div>

            {/* Barra de tasa de éxito global */}
            <div className="mb-4">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="fw-semibold">Tasa de Éxito General</span>
                <span className="fw-semibold text-success">{tasaExitoGeneral}%</span>
              </div>
              <div className="progress" style={{ height: '15px' }}>
                <div 
                  className={`progress-bar ${
                    tasaExitoGeneral >= 90 ? 'bg-success' :
                    tasaExitoGeneral >= 70 ? 'bg-warning' :
                    'bg-danger'
                  }`}
                  style={{ width: `${tasaExitoGeneral}%` }}
                ></div>
              </div>
              <small className="text-muted">
                {estadisticas.totalRegistrosExitosos.toLocaleString()} exitosos de {estadisticas.totalRegistrosProcesados.toLocaleString()} procesados
              </small>
            </div>

            {/* Distribución de estados */}
            <div className="row">
              <div className="col-12">
                <h6 className="mb-3">Distribución de Estados</h6>
                <div className="row">
                  <div className="col-3">
                    <div className="text-center p-3 border rounded">
                      <div className="progress mx-auto mb-2" style={{ width: '60px', height: '60px' }}>
                        <div 
                          className="progress-bar bg-success rounded-circle"
                          style={{ 
                            width: `${(estadisticas.importacionesExitosas / estadisticas.totalImportaciones) * 100}%`,
                            height: `${(estadisticas.importacionesExitosas / estadisticas.totalImportaciones) * 100}%`
                          }}
                        ></div>
                      </div>
                      <div className="fw-semibold text-success">Exitosas</div>
                      <small>{estadisticas.importacionesExitosas}</small>
                    </div>
                  </div>
                  <div className="col-3">
                    <div className="text-center p-3 border rounded">
                      <div className="progress mx-auto mb-2" style={{ width: '60px', height: '60px' }}>
                        <div 
                          className="progress-bar bg-warning rounded-circle"
                          style={{ 
                            width: `${(estadisticas.importacionesConErrores / estadisticas.totalImportaciones) * 100}%`,
                            height: `${(estadisticas.importacionesConErrores / estadisticas.totalImportaciones) * 100}%`
                          }}
                        ></div>
                      </div>
                      <div className="fw-semibold text-warning">Con Errores</div>
                      <small>{estadisticas.importacionesConErrores}</small>
                    </div>
                  </div>
                  <div className="col-3">
                    <div className="text-center p-3 border rounded">
                      <div className="progress mx-auto mb-2" style={{ width: '60px', height: '60px' }}>
                        <div 
                          className="progress-bar bg-danger rounded-circle"
                          style={{ 
                            width: `${(estadisticas.importacionesFallidas / estadisticas.totalImportaciones) * 100}%`,
                            height: `${(estadisticas.importacionesFallidas / estadisticas.totalImportaciones) * 100}%`
                          }}
                        ></div>
                      </div>
                      <div className="fw-semibold text-danger">Fallidas</div>
                      <small>{estadisticas.importacionesFallidas}</small>
                    </div>
                  </div>
                  <div className="col-3">
                    <div className="text-center p-3 border rounded bg-light">
                      <div className="h3 text-primary mb-2">{estadisticas.totalImportaciones}</div>
                      <div className="fw-semibold">Total</div>
                      <small className="text-muted">Importaciones</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Errores más comunes */}
      <div className="col-lg-4 mb-4">
        <div className="card h-100">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h6 className="mb-0">
              <i className="fas fa-exclamation-triangle text-warning me-2"></i>
              Errores Más Comunes
            </h6>
            <span className="badge bg-warning">Top 5</span>
          </div>
          <div className="card-body">
            {estadisticas.erroresComunes?.length > 0 ? (
              estadisticas.erroresComunes.slice(0, 5).map((error, index) => {
                const maxFrecuencia = Math.max(...estadisticas.erroresComunes.map(e => e.frecuencia));
                const porcentaje = (error.frecuencia / maxFrecuencia) * 100;
                
                return (
                  <div key={index} className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span className="small fw-semibold">{error.descripcion}</span>
                      <span className="badge bg-danger">{error.frecuencia}</span>
                    </div>
                    
                    <div className="progress mb-2" style={{ height: '6px' }}>
                      <div 
                        className="progress-bar bg-danger"
                        style={{ width: `${porcentaje}%` }}
                      ></div>
                    </div>
                    
                    <div className="small text-muted mb-2">
                      <strong>Código:</strong> <code>{error.codigo}</code>
                    </div>
                    
                    <div className="small text-success">
                      <i className="fas fa-lightbulb me-1"></i>
                      {error.solucion}
                    </div>
                    
                    {index < estadisticas.erroresComunes.slice(0, 5).length - 1 && (
                      <hr className="mt-3" />
                    )}
                  </div>
                );
              })
            ) : (
              <p className="text-muted text-center py-4">
                <i className="fas fa-check-circle fa-2x text-success mb-2 d-block"></i>
                ¡Excelente! No hay errores registrados
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Recomendaciones de mejora */}
      <div className="col-12">
        <div className="card">
          <div className="card-header">
            <h6 className="mb-0">
              <i className="fas fa-lightbulb text-warning me-2"></i>
              Recomendaciones para Mejorar las Importaciones
            </h6>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-4">
                <div className="alert alert-info" role="alert">
                  <h6 className="alert-heading">
                    <i className="fas fa-file-alt me-2"></i>
                    Preparación de Archivos
                  </h6>
                  <ul className="mb-0">
                    <li>Use el template oficial descargado del sistema</li>
                    <li>Verifique formatos de fecha (DD/MM/AAAA)</li>
                    <li>Elimine espacios en blanco adicionales</li>
                    <li>Guarde en formato UTF-8</li>
                  </ul>
                </div>
              </div>
              
              <div className="col-md-4">
                <div className="alert alert-success" role="alert">
                  <h6 className="alert-heading">
                    <i className="fas fa-check-double me-2"></i>
                    Validación Previa
                  </h6>
                  <ul className="mb-0">
                    <li>Revise la vista previa antes de importar</li>
                    <li>Corrija errores detectados en validación</li>
                    <li>Verifique que los clientes existan</li>
                    <li>Confirme que los montos sean numéricos</li>
                  </ul>
                </div>
              </div>
              
              <div className="col-md-4">
                <div className="alert alert-warning" role="alert">
                  <h6 className="alert-heading">
                    <i className="fas fa-cogs me-2"></i>
                    Optimización
                  </h6>
                  <ul className="mb-0">
                    <li>Importe en lotes de máximo 1,000 registros</li>
                    <li>Realice importaciones en horarios de menor carga</li>
                    <li>Mantenga copias de seguridad de archivos originales</li>
                    <li>Documente errores para futuras importaciones</li>
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

export default EstadisticasImportacion;