/**
 * UsuariosDashboard - Dashboard de estadísticas de usuarios
 */
import React, { useState, useEffect } from 'react';
import { useUsuarios } from '../../hooks/useUsuarios';

const UsuariosDashboard = ({ estadisticas }) => {
  const { loadUsuarios } = useUsuarios();
  const [usuariosRecientes, setUsuariosRecientes] = useState([]);

  useEffect(() => {
    // Cargar usuarios recientes
    const cargarUsuariosRecientes = async () => {
      try {
        const response = await loadUsuarios({ limit: 5, ordering: '-date_joined' });
        setUsuariosRecientes(response.results?.slice(0, 5) || []);
      } catch (error) {
        console.error('Error al cargar usuarios recientes:', error);
      }
    };

    cargarUsuariosRecientes();
  }, [loadUsuarios]);

  // Función para obtener color del rol
  const getRoleColor = (usuario) => {
    if (usuario.is_gerente) return 'success';
    if (usuario.is_vendedor) return 'primary';
    if (usuario.is_distribuidor) return 'info';
    return 'secondary';
  };

  // Función para obtener nombre del rol
  const getRoleName = (usuario) => {
    if (usuario.is_gerente) return 'Gerente';
    if (usuario.is_vendedor) return 'Vendedor';
    if (usuario.is_distribuidor) return 'Distribuidor';
    return 'Usuario';
  };

  // Función para formatear fecha
  const formatFecha = (fecha) => {
    if (!fecha) return 'Nunca';
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!estadisticas) {
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
      {/* Métricas principales */}
      <div className="col-12 mb-4">
        <div className="row g-3">
          {/* Total usuarios */}
          <div className="col-sm-6 col-lg-3">
            <div className="card bg-primary text-white h-100">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <div className="h2 mb-0">{estadisticas.total_usuarios}</div>
                    <div className="small">Total Usuarios</div>
                  </div>
                  <div className="opacity-75">
                    <i className="bi bi-people fs-2"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Usuarios activos */}
          <div className="col-sm-6 col-lg-3">
            <div className="card bg-success text-white h-100">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <div className="h2 mb-0">{estadisticas.activos}</div>
                    <div className="small">Activos</div>
                  </div>
                  <div className="opacity-75">
                    <i className="bi bi-person-check fs-2"></i>
                  </div>
                </div>
                {estadisticas.total_usuarios > 0 && (
                  <div className="mt-2">
                    <small>
                      {Math.round((estadisticas.activos / estadisticas.total_usuarios) * 100)}% del total
                    </small>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Usuarios inactivos */}
          <div className="col-sm-6 col-lg-3">
            <div className="card bg-warning text-white h-100">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <div className="h2 mb-0">{estadisticas.inactivos}</div>
                    <div className="small">Inactivos</div>
                  </div>
                  <div className="opacity-75">
                    <i className="bi bi-person-x fs-2"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Nuevos este mes */}
          <div className="col-sm-6 col-lg-3">
            <div className="card bg-info text-white h-100">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <div className="h2 mb-0">{estadisticas.registrados_mes}</div>
                    <div className="small">Nuevos Este Mes</div>
                  </div>
                  <div className="opacity-75">
                    <i className="bi bi-person-plus fs-2"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Distribución por roles */}
      <div className="col-lg-8 mb-4">
        <div className="row g-3">
          {/* Por roles */}
          <div className="col-md-6">
            <div className="card h-100">
              <div className="card-header">
                <h5 className="card-title mb-0">
                  <i className="bi bi-diagram-3 me-2"></i>
                  Distribución por Roles
                </h5>
              </div>
              <div className="card-body">
                <div className="space-y-3">
                  {/* Gerentes */}
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center">
                      <span className="badge bg-success me-2">Gerentes</span>
                    </div>
                    <div className="d-flex align-items-center">
                      <span className="me-2">{estadisticas.por_rol.gerentes}</span>
                      <div className="progress" style={{ width: '100px', height: '8px' }}>
                        <div 
                          className="progress-bar bg-success"
                          style={{ 
                            width: `${estadisticas.total_usuarios > 0 ? (estadisticas.por_rol.gerentes / estadisticas.total_usuarios) * 100 : 0}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Vendedores */}
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center">
                      <span className="badge bg-primary me-2">Vendedores</span>
                    </div>
                    <div className="d-flex align-items-center">
                      <span className="me-2">{estadisticas.por_rol.vendedores}</span>
                      <div className="progress" style={{ width: '100px', height: '8px' }}>
                        <div 
                          className="progress-bar bg-primary"
                          style={{ 
                            width: `${estadisticas.total_usuarios > 0 ? (estadisticas.por_rol.vendedores / estadisticas.total_usuarios) * 100 : 0}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Distribuidores */}
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center">
                      <span className="badge bg-info me-2">Distribuidores</span>
                    </div>
                    <div className="d-flex align-items-center">
                      <span className="me-2">{estadisticas.por_rol.distribuidores}</span>
                      <div className="progress" style={{ width: '100px', height: '8px' }}>
                        <div 
                          className="progress-bar bg-info"
                          style={{ 
                            width: `${estadisticas.total_usuarios > 0 ? (estadisticas.por_rol.distribuidores / estadisticas.total_usuarios) * 100 : 0}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Métricas de actividad */}
          <div className="col-md-6">
            <div className="card h-100">
              <div className="card-header">
                <h5 className="card-title mb-0">
                  <i className="bi bi-activity me-2"></i>
                  Actividad Reciente
                </h5>
              </div>
              <div className="card-body">
                <div className="space-y-3">
                  {/* Login 24h */}
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <i className="bi bi-clock text-success me-2"></i>
                      Login últimas 24h
                    </div>
                    <span className="badge bg-success">{estadisticas.ultimo_login_24h}</span>
                  </div>

                  {/* Sin login 30 días */}
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <i className="bi bi-exclamation-triangle text-warning me-2"></i>
                      Sin login 30+ días
                    </div>
                    <span className="badge bg-warning">{estadisticas.sin_login_30_dias}</span>
                  </div>

                  {/* Nuevos registros */}
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <i className="bi bi-person-plus text-info me-2"></i>
                      Registros este mes
                    </div>
                    <span className="badge bg-info">{estadisticas.registrados_mes}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Usuarios recientes */}
      <div className="col-lg-4 mb-4">
        <div className="card h-100">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h5 className="card-title mb-0">
              <i className="bi bi-person-lines-fill me-2"></i>
              Usuarios Recientes
            </h5>
            <small className="text-muted">Últimos 5</small>
          </div>
          <div className="card-body p-0">
            {usuariosRecientes.length > 0 ? (
              <div className="list-group list-group-flush">
                {usuariosRecientes.map((usuario) => (
                  <div key={usuario.id} className="list-group-item">
                    <div className="d-flex justify-content-between align-items-start">
                      <div className="flex-grow-1">
                        <div className="d-flex align-items-center mb-1">
                          <h6 className="mb-0 me-2">{usuario.full_name}</h6>
                          <span className={`badge bg-${getRoleColor(usuario)} fs-xs`}>
                            {getRoleName(usuario)}
                          </span>
                        </div>
                        <p className="mb-1 fs-sm text-muted">{usuario.email}</p>
                        <small className="text-muted">
                          Registrado: {formatFecha(usuario.date_joined)}
                        </small>
                      </div>
                      <div className="ms-2">
                        <span className={`badge ${usuario.is_active ? 'bg-success' : 'bg-secondary'} rounded-pill`}>
                          {usuario.is_active ? '●' : '○'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <i className="bi bi-inbox display-4 text-muted"></i>
                <div className="mt-2 text-muted">No hay usuarios recientes</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Resumen de acciones */}
      <div className="col-12">
        <div className="card">
          <div className="card-header">
            <h5 className="card-title mb-0">
              <i className="bi bi-graph-up me-2"></i>
              Resumen del Sistema
            </h5>
          </div>
          <div className="card-body">
            <div className="row text-center">
              <div className="col-md-3">
                <div className="border-end">
                  <div className="h4 text-primary">{estadisticas.total_usuarios}</div>
                  <small className="text-muted">Total de Usuarios</small>
                </div>
              </div>
              <div className="col-md-3">
                <div className="border-end">
                  <div className="h4 text-success">
                    {estadisticas.total_usuarios > 0 ? Math.round((estadisticas.activos / estadisticas.total_usuarios) * 100) : 0}%
                  </div>
                  <small className="text-muted">Tasa de Actividad</small>
                </div>
              </div>
              <div className="col-md-3">
                <div className="border-end">
                  <div className="h4 text-info">{estadisticas.ultimo_login_24h}</div>
                  <small className="text-muted">Activos Hoy</small>
                </div>
              </div>
              <div className="col-md-3">
                <div className="h4 text-warning">{estadisticas.sin_login_30_dias}</div>
                <small className="text-muted">Inactivos 30+ días</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsuariosDashboard;