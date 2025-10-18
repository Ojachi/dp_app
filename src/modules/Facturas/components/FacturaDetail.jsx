/**
 * Componente para mostrar detalles completos de una factura
 */
import React, { useState, useEffect, useCallback } from 'react';
import { formatCurrency, formatDate, getEstadoBadge, getDiasVencimiento } from '../../../utils/formatters';
import { Button } from '../../../components/Button';
import LoadingSpinner from '../../../components/LoadingSpinner';
import { pagosService } from '../../../services/pagosService';

const FacturaDetail = ({
  factura,
  onEdit,
  onDelete,
  onClose,
  canEdit = false,
  canDelete = false,
  canViewPayments = false,
  loading = false
}) => {
  const [pagos, setPagos] = useState([]);
  const [loadingPagos, setLoadingPagos] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  const loadPagos = useCallback(async () => {
    if (!factura?.id) return;
    
    setLoadingPagos(true);
    try {
      const response = await pagosService.getAll({ factura_id: factura.id });
      setPagos(response.results || response);
    } catch (error) {
      console.error('Error cargando pagos:', error);
    } finally {
      setLoadingPagos(false);
    }
  }, [factura?.id]);

  useEffect(() => {
    if (factura && canViewPayments && activeTab === 'pagos') {
      loadPagos();
    }
  }, [factura, canViewPayments, activeTab, loadPagos]);

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
        {canViewPayments && (
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'pagos' ? 'active' : ''}`}
              onClick={() => setActiveTab('pagos')}
            >
              <i className="fas fa-money-bill me-1"></i>
              Pagos
              {factura.total_pagado > 0 && (
                <span className="badge bg-success ms-1">
                  {pagos.length}
                </span>
              )}
            </button>
          </li>
        )}
        {factura.productos && factura.productos.length > 0 && (
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'productos' ? 'active' : ''}`}
              onClick={() => setActiveTab('productos')}
            >
              <i className="fas fa-boxes me-1"></i>
              Productos
            </button>
          </li>
        )}
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
                  
                  {factura.cliente?.telefono && (
                    <div className="mb-3">
                      <label className="form-label text-muted">Teléfono:</label>
                      <div>
                        <a href={`tel:${factura.cliente.telefono}`} className="text-decoration-none">
                          <i className="fas fa-phone me-1"></i>
                          {factura.cliente.telefono}
                        </a>
                      </div>
                    </div>
                  )}
                  
                  {factura.cliente?.email && (
                    <div className="mb-3">
                      <label className="form-label text-muted">Email:</label>
                      <div>
                        <a href={`mailto:${factura.cliente.email}`} className="text-decoration-none">
                          <i className="fas fa-envelope me-1"></i>
                          {factura.cliente.email}
                        </a>
                      </div>
                    </div>
                  )}
                  
                  {factura.cliente?.direccion && (
                    <div className="mb-3">
                      <label className="form-label text-muted">Dirección:</label>
                      <div>{factura.cliente.direccion}</div>
                    </div>
                  )}
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
                  
                  <div className="mb-3">
                    <label className="form-label text-muted">Fecha de Vencimiento:</label>
                    <div className="fw-bold">{formatDate(factura.fecha_vencimiento)}</div>
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label text-muted">Vendedor:</label>
                    <div>{factura.vendedor?.full_name || 'No asignado'}</div>
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label text-muted">Distribuidor:</label>
                    <div>{factura.distribuidor?.full_name || 'No asignado'}</div>
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

        {/* Tab Pagos */}
        {activeTab === 'pagos' && (
          <div>
            {loadingPagos ? (
              <LoadingSpinner message="Cargando pagos..." />
            ) : pagos.length === 0 ? (
              <div className="text-center py-5">
                <i className="fas fa-money-bill fa-3x text-muted mb-3"></i>
                <h5 className="text-muted">Sin pagos registrados</h5>
                <p className="text-muted">Esta factura no tiene pagos asociados.</p>
              </div>
            ) : (
              <div className="card">
                <div className="card-body p-0">
                  <div className="table-responsive">
                    <table className="table table-hover mb-0">
                      <thead className="bg-light">
                        <tr>
                          <th>Fecha</th>
                          <th>Valor</th>
                          <th>Tipo de pago</th>
                          <th>Comprobante</th>
                          <th>Registrado por</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pagos.map((pago) => (
                          <tr key={pago.id}>
                            <td>{formatDate(pago.fecha_pago)}</td>
                            <td className="fw-bold text-success">
                              {formatCurrency(pago.valor_pagado || 0)}
                            </td>
                            <td>
                              <i className={`fas ${
                                pago.tipo_pago === 'efectivo' ? 'fa-money-bill' :
                                pago.tipo_pago === 'transferencia' ? 'fa-university' :
                                pago.tipo_pago === 'cheque' ? 'fa-money-check' : 'fa-credit-card'
                              } me-1`}></i>
                              <span className="text-capitalize">
                                {(pago.tipo_pago || 'sin dato').replace(/_/g, ' ')}
                              </span>
                            </td>
                            <td>{pago.numero_comprobante || '-'}</td>
                            <td>{pago.usuario_nombre || 'N/D'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab Productos */}
        {activeTab === 'productos' && factura.productos && (
          <div className="card">
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th>Producto/Servicio</th>
                      <th>Cantidad</th>
                      <th>Valor Unitario</th>
                      <th>Valor Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {factura.productos.map((producto, index) => (
                      <tr key={index}>
                        <td className="fw-medium">{producto.nombre}</td>
                        <td>{producto.cantidad}</td>
                        <td>{formatCurrency(producto.valor_unitario)}</td>
                        <td className="fw-bold">{formatCurrency(producto.valor_total)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-light">
                    <tr>
                      <th colSpan="3" className="text-end">Total:</th>
                      <th className="text-success">
                        {formatCurrency(factura.productos.reduce((sum, p) => sum + p.valor_total, 0))}
                      </th>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FacturaDetail;