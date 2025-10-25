/**
 * Componente para mostrar detalles completos de una factura
 */
import React, { useState, useEffect } from 'react';
import { formatCurrency, formatDate, getEstadoBadge, getDiasVencimiento } from '../../../utils/formatters';
import { Button } from '../../../components/Button';
import LoadingSpinner from '../../../components/LoadingSpinner';
import { facturasService } from '../../../services/facturasService';
import { Select } from '../../../components/Select';
import { useAuth } from '../../../context/AuthContext';

const FacturaDetail = ({
  factura,
  onEdit,
  onDelete,
  onClose,
  onUpdated = () => {},
  canEdit = false,
  canDelete = false,
  canViewPayments = false,
  canEditEntrega = false,
  loading = false
}) => {
  const [activeTab, setActiveTab] = useState('general');
  const [updatingEntrega, setUpdatingEntrega] = useState(false);
  const [estadoEntrega, setEstadoEntrega] = useState(factura?.estado_entrega || 'pendiente');
  const { isDistribuidor } = useAuth();

  useEffect(() => {
    setEstadoEntrega(factura?.estado_entrega || 'pendiente');
  }, [factura]);

  if (loading || !factura) {
    return <LoadingSpinner message="Cargando detalles..." />;
  }

  const estadoBadge = getEstadoBadge(factura.estado);
  const diasVencimiento = getDiasVencimiento(factura.fecha_vencimiento);

  return (
    <div className="factura-detail">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-start mb-4">
        <div>
          <h4 className="mb-1">
            <i className="fas fa-file-invoice me-2"></i>
            Factura {factura.numero_factura}
          </h4>
          <div className="d-flex align-items-center gap-3">
            <span className={`badge ${estadoBadge.class} fs-6`}>
              {estadoBadge.text}
            </span>
            {diasVencimiento !== null && (
              <small className={
                diasVencimiento < 0 ? 'text-danger fw-bold' :
                diasVencimiento <= 7 ? 'text-warning fw-bold' : 'text-muted'
              }>
                {diasVencimiento < 0 
                  ? `Vencida hace ${Math.abs(diasVencimiento)} días`
                  : diasVencimiento === 0 
                  ? 'Vence hoy'
                  : `Vence en ${diasVencimiento} días`
                }
              </small>
            )}
          </div>
        </div>
        
        <div className="d-flex gap-2">
          {canEdit && (
            <Button
              variant="outline-primary"
              size="sm"
              onClick={() => onEdit(factura)}
            >
              <i className="fas fa-edit me-1"></i>
              Editar
            </Button>
          )}
          
          {canDelete && factura.estado === 'pendiente' && (
            <Button
              variant="outline-danger"
              size="sm"
              onClick={() => onDelete(factura)}
            >
              <i className="fas fa-trash me-1"></i>
              Eliminar
            </Button>
          )}
          
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={onClose}
          >
            <i className="fas fa-times me-1"></i>
            Cerrar
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <ul className="nav nav-tabs mb-3">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'general' ? 'active' : ''}`}
            onClick={() => setActiveTab('general')}
          >
            <i className="fas fa-info-circle me-1"></i>
            General
          </button>
        </li>
      </ul>

      {/* Contenido de tabs */}
      <div className="tab-content">
        {/* Tab General */}
        {activeTab === 'general' && (
          <div className="row">
            {/* Información del cliente */}
            <div className="col-md-6 mb-4">
              <div className="card h-100">
                <div className="card-header">
                  <h6 className="mb-0">
                    <i className="fas fa-user me-2"></i>
                    Información del Cliente
                  </h6>
                </div>
                <div className="card-body">
                  <div className="mb-3">
                    <label className="form-label text-muted">Nombre:</label>
                    <div className="fw-bold">
                      {factura.cliente?.nombre || 'Sin cliente'}
                    </div>
                  </div>
                  
                  {factura.poblacion?.nombre && (
                    <div className="mb-3">
                      <label className="form-label text-muted">Población:</label>
                      <div>{factura.poblacion.nombre}</div>
                    </div>
                  )}

                  <div className="mb-2">
                    <label className="form-label text-muted">Código sucursal:</label>
                    <div>{factura.cliente_codigo || '-'}</div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label text-muted">Condición de Pago:</label>
                    <div>{factura.condicion_pago || '-'}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Información de la factura */}
            <div className="col-md-6 mb-4">
              <div className="card h-100">
                <div className="card-header">
                  <h6 className="mb-0">
                    <i className="fas fa-file-invoice me-2"></i>
                    Detalles de la Factura
                  </h6>
                </div>
                <div className="card-body">
                  <div className="mb-3">
                    <label className="form-label text-muted">Fecha de Emisión:</label>
                    <div className="fw-bold">{formatDate(factura.fecha_emision)}</div>
                  </div>
                  
                  {!isDistribuidor() && (
                    <div className="mb-3">
                      <label className="form-label text-muted">Fecha de Vencimiento:</label>
                      <div className="fw-bold">{formatDate(factura.fecha_vencimiento)}</div>
                    </div>
                  )}
                  
                  <div className="mb-3">
                    <label className="form-label text-muted">Vendedor:</label>
                    <div>{factura.vendedor?.full_name || 'No asignado'}</div>
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label text-muted">Distribuidor:</label>
                    <div>{factura.distribuidor?.full_name || 'No asignado'}</div>
                  </div>

                  {/* Estado de entrega */}
                  <div className="mb-2">
                    <label className="form-label text-muted d-block">Estado de Entrega:</label>
                    <div className="d-flex align-items-center gap-2">
                      <div style={{minWidth: 260}}>
                        <Select
                          value={estadoEntrega}
                          onChange={(v) => setEstadoEntrega(v)}
                          options={[
                            { value: 'pendiente', label: 'Pendiente' },
                            { value: 'entregado', label: 'Entregado' },
                            { value: 'devolucion_total', label: 'Devolución total' }
                          ]}
                          placeholder={null}
                          disabled={updatingEntrega || !(canEditEntrega || canEdit || factura?.puede_editar_entrega)}
                        />
                      </div>
                      <Button
                        variant="primary"
                        size="sm"
                        loading={updatingEntrega}
                        disabled={updatingEntrega || !(canEditEntrega || canEdit || factura?.puede_editar_entrega)}
                        onClick={async () => {
                          try {
                            setUpdatingEntrega(true);
                            const updated = await facturasService.patchFactura(factura.id, { estado_entrega: estadoEntrega });
                            // disparar callback al padre para refrescar estado
                            try {
                              onUpdated(updated);
                            } catch (cbErr) {
                              console.warn('onUpdated callback lanzó un error, se ignora:', cbErr);
                            }
                            // sincronización local mínima como respaldo
                            if (updated && updated.estado_entrega) {
                              factura.estado_entrega = updated.estado_entrega;
                            } else {
                              factura.estado_entrega = estadoEntrega;
                            }
                          } catch (e) {
                            console.error('Error actualizando estado de entrega:', e);
                          } finally {
                            setUpdatingEntrega(false);
                          }
                        }}
                      >
                        <i className="fas fa-save me-1"></i>
                        Guardar
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Resumen financiero */}
            <div className="col-12 mb-4">
              <div className="card">
                <div className="card-header">
                  <h6 className="mb-0">
                    <i className="fas fa-calculator me-2"></i>
                    Resumen Financiero
                  </h6>
                </div>
                <div className="card-body">
                  <div className="row text-center">
                    <div className="col-md-3">
                      <div className="border-end">
                        <div className="h4 text-primary mb-1">
                          {formatCurrency(factura.valor_total)}
                        </div>
                        <div className="text-muted small">Valor Total</div>
                      </div>
                    </div>
                    
                    <div className="col-md-3">
                      <div className="border-end">
                        <div className="h4 text-success mb-1">
                          {formatCurrency(factura.total_pagado || 0)}
                        </div>
                        <div className="text-muted small">Total Pagado</div>
                      </div>
                    </div>
                    
                    <div className="col-md-3">
                      <div className="border-end">
                        <div className={`h4 mb-1 ${factura.saldo_pendiente > 0 ? 'text-warning' : 'text-muted'}`}>
                          {formatCurrency(factura.saldo_pendiente)}
                        </div>
                        <div className="text-muted small">Saldo Pendiente</div>
                      </div>
                    </div>
                    
                    <div className="col-md-3">
                      <div className="h4 text-info mb-1">
                        {factura.saldo_pendiente === 0 ? '100%' : 
                         `${Math.round((factura.total_pagado / factura.valor_total) * 100)}%`}
                      </div>
                      <div className="text-muted small">Completado</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Observaciones */}
            {factura.observaciones && (
              <div className="col-12">
                <div className="card">
                  <div className="card-header">
                    <h6 className="mb-0">
                      <i className="fas fa-sticky-note me-2"></i>
                      Observaciones
                    </h6>
                  </div>
                  <div className="card-body">
                    <p className="mb-0">{factura.observaciones}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        
      </div>
    </div>
  );
};

export default FacturaDetail;