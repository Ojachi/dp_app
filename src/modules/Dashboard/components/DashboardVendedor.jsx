/**
 * Dashboard para rol Vendedor - Vista de sus facturas y pagos
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency, formatDate } from '../../../utils/formatters';
import StatsCard from './StatsCard';

const DashboardVendedor = ({ data, user }) => {
  const navigate = useNavigate();
  
  const facturasStats = data?.facturas?.estadisticas || {};
  const facturasRecientes = data?.facturas?.facturas_recientes || [];
  const alertas = data?.alertas || {};

  return (
    <div>
      {/* Métricas del vendedor */}
      <div className="row mb-4">
        <div className="col-lg-3 col-md-6 mb-3">
          <StatsCard
            title="Mis Facturas"
            value={facturasStats.total_facturas || 0}
            icon="fas fa-file-invoice"
            color="primary"
            onClick={() => navigate('/facturas')}
          />
        </div>
        <div className="col-lg-3 col-md-6 mb-3">
          <StatsCard
            title="Pendientes"
            value={facturasStats.facturas_pendientes || 0}
            icon="fas fa-clock"
            color="warning"
            onClick={() => navigate('/facturas?estado=pendiente')}
          />
        </div>
        <div className="col-lg-3 col-md-6 mb-3">
          <StatsCard
            title="Pagadas"
            value={facturasStats.facturas_pagadas || 0}
            icon="fas fa-check-circle"
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
        {/* Facturas recientes */}
        <div className="col-lg-8 mb-4">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <i className="fas fa-file-invoice me-2"></i>
                Mis Facturas Recientes
              </h5>
              <button
                className="btn btn-outline-primary btn-sm"
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
                          <td>{factura.cliente?.nombre}</td>
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
                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => navigate(`/facturas/${factura.id}`)}
                            >
                              Ver
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-4">
                  <i className="fas fa-file-invoice fa-3x text-muted mb-3"></i>
                  <p className="text-muted">No tienes facturas asignadas</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Panel de acciones */}
        <div className="col-lg-4 mb-4">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="fas fa-bolt me-2"></i>
                Acciones Rápidas
              </h5>
            </div>
            <div className="card-body">
              <div className="d-grid gap-2">
                <button
                  className="btn btn-success"
                  onClick={() => navigate('/pagos/crear')}
                >
                  <i className="fas fa-money-bill me-2"></i>
                  Registrar Pago
                </button>
                <button
                  className="btn btn-info"
                  onClick={() => navigate('/facturas?estado=pendiente')}
                >
                  <i className="fas fa-clock me-2"></i>
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
                <h6 className="text-muted">Mi Rendimiento</h6>
                <div className="mb-2">
                  <small className="text-muted">Efectividad de cobro</small>
                  <div className="progress">
                    <div
                      className="progress-bar bg-success"
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
                </div>
              </div>
            </div>
          </div>

          {/* Alertas recientes */}
          <div className="card mt-3">
            <div className="card-header">
              <h6 className="mb-0">
                <i className="fas fa-bell me-2"></i>
                Alertas Recientes
              </h6>
            </div>
            <div className="card-body">
              {alertas.nuevas > 0 ? (
                <div className="text-center">
                  <i className="fas fa-bell fa-2x text-warning mb-2"></i>
                  <p className="mb-1">
                    Tienes <strong>{alertas.nuevas}</strong> alertas nuevas
                  </p>
                  <button
                    className="btn btn-sm btn-outline-warning"
                    onClick={() => navigate('/alertas')}
                  >
                    Ver todas
                  </button>
                </div>
              ) : (
                <div className="text-center text-muted">
                  <i className="fas fa-check-circle fa-2x text-success mb-2"></i>
                  <p className="mb-0">No hay alertas nuevas</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardVendedor;