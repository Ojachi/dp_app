/**
 * Tabla de facturas con paginación y acciones
 */
import React from 'react';
import { formatCurrency, formatDate, getEstadoBadge, getDiasVencimiento, getEstadoEntregaBadge } from '../../../utils/formatters';
import LoadingSpinner from '../../../components/LoadingSpinner';
import { Pagination } from '../../../components/Pagination';

const FacturasTable = ({
  facturas,
  pagination,
  onViewDetail,
  onEdit,
  onDelete,
  canEdit = false,
  canDelete = false,
  loading = false,
  error = null,
  isDistribuidor = false
}) => {
  
  if (loading) {
    return <LoadingSpinner message="Cargando facturas..." />;
  }

  if (error) {
    return (
      <div className="alert alert-danger">
        <i className="fas fa-exclamation-triangle me-2"></i>
        {error}
      </div>
    );
  }

  if (!facturas || facturas.length === 0) {
    return (
      <div className="card">
        <div className="card-body text-center py-5">
          <i className="fas fa-file-invoice fa-3x text-muted mb-3"></i>
          <h5 className="text-muted">No se encontraron facturas</h5>
          <p className="text-muted">
            No hay facturas que coincidan con los filtros aplicados.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="mb-0">
          <i className="fas fa-list me-2"></i>
          Listado de Facturas
        </h5>
        <span className="badge bg-primary">
          {pagination?.totalItems || facturas.length} facturas
        </span>
      </div>
      
      <div className="card-body p-0">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead className="bg-light">
              <tr>
                <th>Número</th>
                <th>Código Cliente</th>
                <th>Cliente</th>
                <th>Condición</th>
                <th>Vendedor</th>
                <th>Distribuidor</th>
                <th>Valor Total</th>
                <th>Saldo</th>
                <th>Estado</th>
                {!isDistribuidor && <th>Vencimiento</th>}
                <th>Entrega</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {facturas.map((factura) => {
                const estadoBadge = getEstadoBadge(factura.estado);
                const diasVencimiento = getDiasVencimiento(factura.fecha_vencimiento);
                const estadoEntregaBadge = getEstadoEntregaBadge(factura.estado_entrega);

                return (
                  <tr key={factura.id} className="align-middle">
                    <td>
                      <div className="fw-bold text-primary">
                        {factura.numero_factura}
                      </div>
                      <small className="text-muted">
                        {formatDate(factura.fecha_emision)}
                      </small>
                    </td>
                    <td>
                      <span>{factura.cliente_codigo || '-'}</span>
                    </td>

                    <td>
                      <div className="fw-medium">
                        {factura.cliente_nombre || 'Sin cliente'}
                      </div>
                      {factura.cliente_telefono && (
                        <small className="text-muted">
                          <i className="fas fa-phone me-1"></i>
                          {factura.cliente_telefono}
                        </small>
                      )}
                    </td>
                    <td>
                      <span>{factura.condicion_pago || '-'}</span>
                    </td>
                    
                    <td>
                      <span className="text-dark">
                        {factura.vendedor_nombre || 'No asignado'}
                      </span>
                    </td>
                    
                    <td>
                      <span className="text-dark">
                        {factura.distribuidor_nombre || 'No asignado'}
                      </span>
                    </td>
                    
                    <td>
                      <div className="fw-bold text-success">
                        {formatCurrency(factura.valor_total)}
                      </div>
                    </td>
                    
                    <td>
                      <div className={factura.saldo_pendiente > 0 ? 'text-warning fw-bold' : 'text-muted'}>
                        {formatCurrency(factura.saldo_pendiente)}
                      </div>
                      {factura.total_pagado > 0 && (
                        <small className="text-success d-block">
                          Pagado: {formatCurrency(factura.total_pagado)}
                        </small>
                      )}
                    </td>
                    
                    <td>
                      <span className={`badge ${estadoBadge.class}`}>
                        {estadoBadge.text}
                      </span>
                    </td>
                    
                    {!isDistribuidor && (
                    <td>
                      <div>
                        {formatDate(factura.fecha_vencimiento)}
                      </div>
                      {diasVencimiento !== null && (
                        <small className={
                          diasVencimiento < 0 ? 'text-danger' :
                          diasVencimiento <= 7 ? 'text-warning' : 'text-success'
                        }>
                          {diasVencimiento < 0 
                            ? `Vencida hace ${Math.abs(diasVencimiento)} días`
                            : diasVencimiento === 0 
                            ? 'Vence hoy'
                            : `Vence en ${diasVencimiento} días`
                          }
                        </small>
                      )}
                    </td>
                    )}

                    <td>
                      <span className={`badge ${estadoEntregaBadge.class}`}>
                        {estadoEntregaBadge.text} 
                      </span>
                    </td>
                    
                    <td>
                      <div className="btn-group btn-group-sm">
                        <button
                          className="btn btn-outline-primary"
                          onClick={() => onViewDetail(factura)}
                          title="Ver detalles"
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        
                        {canEdit && (
                          <button
                            className="btn btn-outline-secondary"
                            onClick={() => onEdit(factura)}
                            title="Editar"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                        )}
                        
                        {canDelete && factura.estado === 'pendiente' && (
                          <button
                            className="btn btn-outline-danger"
                            onClick={() => onDelete(factura)}
                            title="Eliminar"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Paginación */}
      {pagination && pagination.totalPages > 1 && (
        <div className="card-footer">
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={(page) => {
              // Esta función debería ser pasada desde el componente padre
              console.log('Cambiar a página:', page);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default FacturasTable;