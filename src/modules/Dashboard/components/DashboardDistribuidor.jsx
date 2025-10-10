/**
 * Dashboard para rol Distribuidor - Vista de entregas y cobros
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency, formatDate } from '../../../utils/formatters';
import StatsCard from './StatsCard';

const DashboardDistribuidor = ({ data, user }) => {
  const navigate = useNavigate();
  
  const facturasStats = data?.facturas?.estadisticas || {};
  const facturasRecientes = data?.facturas?.facturas_recientes || [];
  const alertas = data?.alertas || {};

  return (
    <div>
      {/* Métricas del distribuidor */}
      <div className="row mb-4">
        <div className="col-lg-3 col-md-6 mb-3">
          <StatsCard
            title="Facturas Asignadas"
            value={facturasStats.total_facturas || 0}
            icon="fas fa-truck"
            color="info"
            onClick={() => navigate('/facturas')}
          />
        </div>
        <div className="col-lg-3 col-md-6 mb-3">
          <StatsCard
            title="Por Entregar"
            value={facturasStats.facturas_pendientes || 0}
            icon="fas fa-box"
            color="warning"
            onClick={() => navigate('/facturas?estado=pendiente')}
          />
        </div>
        <div className="col-lg-3 col-md-6 mb-3">
          <StatsCard
            title="Entregadas"
            value={facturasStats.facturas_pagadas || 0}
            icon="fas fa-check-double"
            color="success"
            onClick={() => navigate('/facturas?estado=pagada')}
          />
        </div>
        <div className="col-lg-3 col-md-6 mb-3">
          <StatsCard
            title="Mis Alertas"
            value={alertas.nuevas || 0}
            icon="fas fa-bell"
            color="danger"
            onClick={() => navigate('/alertas')}
          />
        </div>
      </div>

      {/* Contenido principal */}
      <div className="row">
        {/* Facturas para entregar */}
        <div className="col-lg-8 mb-4">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <i className="fas fa-truck me-2"></i>
                Facturas para Entrega
              </h5>
              <button
                className="btn btn-outline-info btn-sm"
                onClick={() => navigate('/facturas')}
              >
                Ver todas
              </button>
            </div>
            <div className="card-body">
              {facturasRecientes.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Número</th>
                        <th>Cliente</th>
                        <th>Vendedor</th>
                        <th>Valor</th>
                        <th>Estado</th>
                        <th>Vencimiento</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {facturasRecientes.slice(0, 5).map((factura) => (
                        <tr key={factura.id}>
                          <td>
                            <strong>{factura.numero_factura}</strong>
                          </td>
                          <td>
                            <div>
                              <strong>{factura.cliente?.nombre}</strong>
                              {factura.cliente?.telefono && (
                                <div>
                                  <small className="text-muted">
                                    <i className="fas fa-phone me-1"></i>
                                    {factura.cliente.telefono}
                                  </small>
                                </div>
                              )}
                            </div>
                          </td>
                          <td>{factura.vendedor_nombre}</td>
                          <td>{formatCurrency(factura.valor_total)}</td>
                          <td>
                            <span className={`badge ${
                              factura.estado === 'pagada' ? 'bg-success' :
                              factura.estado === 'parcial' ? 'bg-info' :
                              factura.estado === 'vencida' ? 'bg-danger' :
                              'bg-warning'
                            }`}>
                              {factura.estado}
                            </span>
                          </td>
                          <td>{formatDate(factura.fecha_vencimiento)}</td>
                          <td>
                            <div className="btn-group btn-group-sm">
                              <button
                                className="btn btn-outline-primary"
                                onClick={() => navigate(`/facturas/${factura.id}`)}
                                title="Ver detalles"
                              >
                                <i className="fas fa-eye"></i>
                              </button>
                              {factura.estado !== 'pagada' && (
                                <button
                                  className="btn btn-outline-success"
                                  onClick={() => navigate('/pagos/crear', { 
                                    state: { facturaId: factura.id } 
                                  })}
                                  title="Registrar pago"
                                >
                                  <i className="fas fa-money-bill"></i>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-4">
                  <i className="fas fa-truck fa-3x text-muted mb-3"></i>
                  <p className="text-muted">No tienes facturas asignadas para entrega</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Panel de herramientas del distribuidor */}
        <div className="col-lg-4 mb-4">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="fas fa-tools me-2"></i>
                Herramientas de Entrega
              </h5>
            </div>
            <div className="card-body">
              <div className="d-grid gap-2">
                <button
                  className="btn btn-success"
                  onClick={() => navigate('/pagos/crear')}
                >
                  <i className="fas fa-money-bill me-2"></i>
                  Registrar Cobro
                </button>
                <button
                  className="btn btn-info"
                  onClick={() => navigate('/facturas?estado=pendiente')}
                >
                  <i className="fas fa-truck me-2"></i>
                  Ver Pendientes
                </button>
                <button
                  className="btn btn-warning"
                  onClick={() => navigate('/alertas')}
                >
                  <i className="fas fa-bell me-2"></i>
                  Ver Alertas {alertas.nuevas > 0 && `(${alertas.nuevas})`}
                </button>
              </div>

              <hr />

              <div className="mt-3">
                <h6 className="text-muted">Mi Progreso</h6>
                <div className="mb-2">
                  <small className="text-muted">Entregas completadas</small>
                  <div className="progress">
                    <div
                      className="progress-bar bg-info"
                      role="progressbar"
                      style={{
                        width: `${
                          facturasStats.total_facturas > 0 
                            ? ((facturasStats.facturas_pagadas / facturasStats.total_facturas) * 100)
                            : 0
                        }%`
                      }}
                    ></div>
                  </div>
                  <small className="text-muted">
                    {facturasStats.facturas_pagadas || 0} de {facturasStats.total_facturas || 0}
                  </small>
                </div>
              </div>
            </div>
          </div>

          {/* Recordatorios */}
          <div className="card mt-3">
            <div className="card-header">
              <h6 className="mb-0">
                <i className="fas fa-clipboard-check me-2"></i>
                Recordatorios
              </h6>
            </div>
            <div className="card-body">
              <ul className="list-unstyled mb-0">
                <li className="mb-2">
                  <i className="fas fa-check-circle text-success me-2"></i>
                  <small>Confirmar entrega al cliente</small>
                </li>
                <li className="mb-2">
                  <i className="fas fa-money-bill text-warning me-2"></i>
                  <small>Registrar pago inmediatamente</small>
                </li>
                <li className="mb-2">
                  <i className="fas fa-phone text-info me-2"></i>
                  <small>Contactar al vendedor si hay problemas</small>
                </li>
                <li className="mb-0">
                  <i className="fas fa-bell text-danger me-2"></i>
                  <small>Revisar alertas diariamente</small>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardDistribuidor;