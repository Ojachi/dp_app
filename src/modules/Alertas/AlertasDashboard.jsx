/**
 * AlertasDashboard - Dashboard de alertas y estadísticas
 */
import React, { useState, useEffect } from 'react';
import { useAlertas } from '../../hooks/useAlertas';

const AlertasDashboard = ({ contadores }) => {
  const { loadEstadisticas } = useAlertas();
  const [estadisticas, setEstadisticas] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const cargarEstadisticas = async () => {
      try {
        setLoading(true);
        const data = await loadEstadisticas();
        setEstadisticas(data);
      } catch (error) {
        console.error('Error al cargar estadísticas:', error);
      } finally {
        setLoading(false);
      }
    };

    cargarEstadisticas();
  }, [loadEstadisticas]);

  // Función para obtener color de prioridad
  const getPrioridadColor = (prioridad) => {
    switch (prioridad?.toLowerCase()) {
      case 'alta': return 'danger';
      case 'media': return 'warning';
      case 'baja': return 'info';
      default: return 'secondary';
    }
  };

  // Función para obtener color de tipo
  const getTipoColor = (tipo) => {
    switch (tipo?.toLowerCase()) {
      case 'sistema': return 'primary';
      case 'factura': return 'success';
      case 'pago': return 'info';
      case 'cartera': return 'warning';
      case 'importacion': return 'secondary';
      default: return 'light';
    }
  };

  if (loading && !contadores) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="row">
      {/* Resumen general */}
      <div className="col-12 mb-4">
        <div className="row g-3">
          {/* Total alertas */}
          <div className="col-sm-6 col-lg-3">
            <div className="card bg-primary text-white h-100">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <div className="h2 mb-0">{contadores?.total || 0}</div>
                    <div className="small">Total Alertas</div>
                  </div>
                  <div className="opacity-75">
                    <i className="bi bi-bell fs-2"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* No leídas */}
          <div className="col-sm-6 col-lg-3">
            <div className="card bg-danger text-white h-100">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <div className="h2 mb-0">{contadores?.no_leidas || 0}</div>
                    <div className="small">No Leídas</div>
                  </div>
                  <div className="opacity-75">
                    <i className="bi bi-exclamation-circle fs-2"></i>
                  </div>
                </div>
                {contadores?.total > 0 && (
                  <div className="mt-2">
                    <small>
                      {Math.round((contadores.no_leidas / contadores.total) * 100)}% del total
                    </small>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recientes (últimas 24h) */}
          <div className="col-sm-6 col-lg-3">
            <div className="card bg-success text-white h-100">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <div className="h2 mb-0">{contadores?.recientes || 0}</div>
                    <div className="small">Últimas 24h</div>
                  </div>
                  <div className="opacity-75">
                    <i className="bi bi-clock fs-2"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Promedio respuesta */}
          <div className="col-sm-6 col-lg-3">
            <div className="card bg-info text-white h-100">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <div className="h2 mb-0">{estadisticas?.tiempo_promedio_respuesta || '0h'}</div>
                    <div className="small">Tiempo Promedio</div>
                  </div>
                  <div className="opacity-75">
                    <i className="bi bi-stopwatch fs-2"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos y estadísticas */}
      <div className="col-lg-8 mb-4">
        <div className="row g-3">
          {/* Por Prioridad */}
          <div className="col-md-6">
            <div className="card h-100">
              <div className="card-header">
                <h5 className="card-title mb-0">
                  <i className="bi bi-flag me-2"></i>
                  Por Prioridad
                </h5>
              </div>
              <div className="card-body">
                {contadores?.por_prioridad ? (
                  <div className="space-y-3">
                    {Object.entries(contadores.por_prioridad).map(([prioridad, cantidad]) => (
                      <div key={prioridad} className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center">
                          <span className={`badge bg-${getPrioridadColor(prioridad)} me-2`}>
                            {prioridad.charAt(0).toUpperCase() + prioridad.slice(1)}
                          </span>
                        </div>
                        <div className="d-flex align-items-center">
                          <span className="me-2">{cantidad}</span>
                          <div className="progress" style={{ width: '100px', height: '8px' }}>
                            <div 
                              className={`progress-bar bg-${getPrioridadColor(prioridad)}`}
                              style={{ 
                                width: `${contadores.total > 0 ? (cantidad / contadores.total) * 100 : 0}%` 
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-3">
                    <div className="text-muted">Sin datos disponibles</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Por Tipo */}
          <div className="col-md-6">
            <div className="card h-100">
              <div className="card-header">
                <h5 className="card-title mb-0">
                  <i className="bi bi-tags me-2"></i>
                  Por Tipo
                </h5>
              </div>
              <div className="card-body">
                {contadores?.por_tipo && Object.keys(contadores.por_tipo).length > 0 ? (
                  <div className="space-y-3">
                    {Object.entries(contadores.por_tipo).map(([tipo, cantidad]) => (
                      <div key={tipo} className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center">
                          <span className={`badge bg-${getTipoColor(tipo)} me-2`}>
                            {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                          </span>
                        </div>
                        <div className="d-flex align-items-center">
                          <span className="me-2">{cantidad}</span>
                          <div className="progress" style={{ width: '100px', height: '8px' }}>
                            <div 
                              className={`progress-bar bg-${getTipoColor(tipo)}`}
                              style={{ 
                                width: `${contadores.total > 0 ? (cantidad / contadores.total) * 100 : 0}%` 
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-3">
                    <div className="text-muted">Sin datos disponibles</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tendencia semanal */}
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h5 className="card-title mb-0">
                  <i className="bi bi-graph-up me-2"></i>
                  Tendencia Semanal
                </h5>
              </div>
              <div className="card-body">
                {estadisticas?.tendencia_semanal ? (
                  <div className="row text-center">
                    {estadisticas.tendencia_semanal.map((dia, index) => (
                      <div key={index} className="col">
                        <div className="mb-2">
                          <div className="h4 text-primary">{dia.cantidad}</div>
                          <small className="text-muted">{dia.dia}</small>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-3">
                    <div className="text-muted">Cargando datos de tendencia...</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Alertas recientes */}
      <div className="col-lg-4 mb-4">
        <div className="card h-100">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h5 className="card-title mb-0">
              <i className="bi bi-clock-history me-2"></i>
              Alertas Recientes
            </h5>
            <small className="text-muted">Últimas 5</small>
          </div>
          <div className="card-body p-0">
            {estadisticas?.alertas_recientes?.length > 0 ? (
              <div className="list-group list-group-flush">
                {estadisticas.alertas_recientes.slice(0, 5).map((alerta, index) => (
                  <div key={alerta.id || index} className="list-group-item">
                    <div className="d-flex justify-content-between align-items-start">
                      <div className="flex-grow-1">
                        <div className="d-flex align-items-center mb-1">
                          <span className={`badge bg-${getPrioridadColor(alerta.prioridad)} me-2 fs-xs`}>
                            {alerta.prioridad}
                          </span>
                          <span className={`badge bg-${getTipoColor(alerta.tipo)} fs-xs`}>
                            {alerta.tipo}
                          </span>
                        </div>
                        <h6 className="mb-1 fs-sm">{alerta.titulo}</h6>
                        <p className="mb-1 fs-xs text-muted">
                          {alerta.mensaje?.length > 60 
                            ? `${alerta.mensaje.substring(0, 60)}...` 
                            : alerta.mensaje
                          }
                        </p>
                        <small className="text-muted">
                          {new Date(alerta.created_at).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </small>
                      </div>
                      {!alerta.leida && (
                        <div className="ms-2">
                          <span className="badge bg-danger rounded-pill">●</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <i className="bi bi-inbox display-4 text-muted"></i>
                <div className="mt-2 text-muted">No hay alertas recientes</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertasDashboard;