/**
 * Dashboard para rol Gerente - Vista completa con todas las métricas
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../../../utils/formatters';
import StatsCard from './StatsCard';
import ChartCard from './ChartCard';
import AlertasCard from './AlertasCard';

const DashboardGerente = ({ data, user }) => {
  const navigate = useNavigate();
  
  const facturasStats = data?.facturas?.estadisticas || {};
  const montos = data?.facturas?.montos || {};
  const pagosStats = data?.pagos || {};
  const alertas = data?.alertas || {};

  return (
    <div>
      {/* Métricas principales */}
      <div className="row mb-4">
        <div className="col-lg-3 col-md-6 mb-3">
          <StatsCard
            title="Total Facturas"
            value={facturasStats.total_facturas || 0}
            icon="fas fa-file-invoice"
            color="primary"
            onClick={() => navigate('/facturas')}
          />
        </div>
        <div className="col-lg-3 col-md-6 mb-3">
          <StatsCard
            title="Total Cartera"
            value={formatCurrency(montos.total_cartera || 0)}
            icon="fas fa-wallet"
            color="success"
            onClick={() => navigate('/cartera')}
          />
        </div>
        <div className="col-lg-3 col-md-6 mb-3">
          <StatsCard
            title="Pendiente Cobro"
            value={formatCurrency(montos.total_pendiente || 0)}
            icon="fas fa-clock"
            color="warning"
            onClick={() => navigate('/facturas?estado=pendiente')}
          />
        </div>
        <div className="col-lg-3 col-md-6 mb-3">
          <StatsCard
            title="Alertas Nuevas"
            value={alertas.nuevas || 0}
            icon="fas fa-bell"
            color="danger"
            onClick={() => navigate('/alertas')}
          />
        </div>
      </div>

      {/* Segunda fila de métricas */}
      <div className="row mb-4">
        <div className="col-lg-3 col-md-6 mb-3">
          <StatsCard
            title="Facturas Pagadas"
            value={facturasStats.facturas_pagadas || 0}
            icon="fas fa-check-circle"
            color="success"
            subtitle={`${formatCurrency(montos.total_pagado || 0)} recaudado`}
          />
        </div>
        <div className="col-lg-3 col-md-6 mb-3">
          <StatsCard
            title="Facturas Vencidas"
            value={facturasStats.facturas_vencidas || 0}
            icon="fas fa-exclamation-triangle"
            color="danger"
            onClick={() => navigate('/facturas?vencidas=true')}
          />
        </div>
        <div className="col-lg-3 col-md-6 mb-3">
          <StatsCard
            title="Pagos Parciales"
            value={facturasStats.facturas_parciales || 0}
            icon="fas fa-chart-pie"
            color="info"
            onClick={() => navigate('/facturas?estado=parcial')}
          />
        </div>
        <div className="col-lg-3 col-md-6 mb-3">
          <StatsCard
            title="Pagos del Mes"
            value={pagosStats.pagos_mes || 0}
            icon="fas fa-money-bill-wave"
            color="primary"
            onClick={() => navigate('/pagos')}
          />
        </div>
      </div>

      {/* Gráficos y datos avanzados */}
      <div className="row">
        <div className="col-lg-8 mb-4">
          <ChartCard
            title="Evolución de Pagos (Últimos 30 días)"
            data={data?.facturas}
            type="line"
          />
        </div>
        <div className="col-lg-4 mb-4">
          <AlertasCard
            alertas={data?.alertas}
            onViewAll={() => navigate('/alertas')}
          />
        </div>
      </div>

      <div className="row">
        <div className="col-lg-6 mb-4">
          <ChartCard
            title="Distribución de Estados de Facturas"
            data={facturasStats}
            type="doughnut"
          />
        </div>
        <div className="col-lg-6 mb-4">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <i className="fas fa-chart-line me-2"></i>
                Acciones Rápidas
              </h5>
            </div>
            <div className="card-body">
              <div className="d-grid gap-2">
                <button
                  className="btn btn-outline-primary"
                  onClick={() => navigate('/facturas/crear')}
                >
                  <i className="fas fa-plus me-2"></i>
                  Crear Nueva Factura
                </button>
                <button
                  className="btn btn-outline-success"
                  onClick={() => navigate('/pagos/crear')}
                >
                  <i className="fas fa-money-bill me-2"></i>
                  Registrar Pago
                </button>
                <button
                  className="btn btn-outline-info"
                  onClick={() => navigate('/importacion')}
                >
                  <i className="fas fa-file-upload me-2"></i>
                  Importar Excel
                </button>
                <button
                  className="btn btn-outline-secondary"
                  onClick={() => navigate('/usuarios')}
                >
                  <i className="fas fa-users me-2"></i>
                  Gestionar Usuarios
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardGerente;