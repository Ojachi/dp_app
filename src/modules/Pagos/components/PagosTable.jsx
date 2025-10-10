/**
 * Tabla de Pagos con paginación y acciones
 */
import React, { useState } from 'react';
import { Table } from '../../../components/Table';
import { Pagination } from '../../../components/Pagination';
import { Button } from '../../../components/Button';
import PagoDetalleModal from './PagoDetalleModal';

const PagosTable = ({ 
  pagos, 
  loading, 
  pagination, 
  onPageChange, 
  onEdit, 
  onDelete 
}) => {
  const [selectedPago, setSelectedPago] = useState(null);
  const [showDetalleModal, setShowDetalleModal] = useState(false);
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-CO');
  };

  const getEstadoBadge = (estado) => {
    const estados = {
      'completado': 'success',
      'pendiente': 'warning',
      'cancelado': 'danger',
      'procesando': 'info'
    };
    
    return (
      <span className={`badge bg-${estados[estado] || 'secondary'}`}>
        {estado?.toUpperCase() || 'N/A'}
      </span>
    );
  };

  const getMetodoPagoIcon = (metodo) => {
    const iconos = {
      'efectivo': 'fas fa-money-bill',
      'transferencia': 'fas fa-exchange-alt',
      'cheque': 'fas fa-check-square',
      'tarjeta': 'fas fa-credit-card',
      'consignacion': 'fas fa-university',
      'otro': 'fas fa-ellipsis-h'
    };
    
    return iconos[metodo] || 'fas fa-question';
  };

  const columns = [
    {
      key: 'numero',
      header: 'Número',
      render: (pago) => (
        <div>
          <div className="fw-medium">{pago.numero || `P-${pago.id}`}</div>
          <small className="text-muted">{formatDate(pago.fecha_pago)}</small>
        </div>
      )
    },
    {
      key: 'factura',
      header: 'Factura',
      render: (pago) => (
        <div>
          <div className="fw-medium">{pago.factura?.numero || 'N/A'}</div>
          <small className="text-muted">
            Cliente: {pago.factura?.cliente?.nombre || pago.cliente?.nombre || 'N/A'}
          </small>
        </div>
      )
    },
    {
      key: 'monto',
      header: 'Monto',
      render: (pago) => (
        <div className="text-end">
          <div className="fw-bold text-success">
            {formatCurrency(pago.monto)}
          </div>
          {pago.monto_aplicado && pago.monto_aplicado !== pago.monto && (
            <small className="text-muted">
              Aplicado: {formatCurrency(pago.monto_aplicado)}
            </small>
          )}
        </div>
      )
    },
    {
      key: 'metodo_pago',
      header: 'Método',
      render: (pago) => (
        <div className="d-flex align-items-center">
          <i className={`${getMetodoPagoIcon(pago.metodo_pago)} me-2 text-primary`}></i>
          <span className="text-capitalize">
            {pago.metodo_pago_display || pago.metodo_pago || 'N/A'}
          </span>
        </div>
      )
    },
    {
      key: 'estado',
      header: 'Estado',
      render: (pago) => getEstadoBadge(pago.estado)
    },
    {
      key: 'usuario',
      header: 'Registrado por',
      render: (pago) => (
        <div>
          <small className="text-muted">
            {pago.usuario?.full_name || pago.usuario?.email || 'N/A'}
          </small>
        </div>
      )
    },
    {
      key: 'acciones',
      header: 'Acciones',
      render: (pago) => (
        <div className="d-flex gap-1">
          <Button
            variant="outline-info"
            size="sm"
            title="Ver detalles"
            onClick={() => handleViewDetails(pago)}
          >
            <i className="fas fa-eye"></i>
          </Button>
          {onEdit && (
            <Button
              variant="outline-primary"
              size="sm"
              title="Editar"
              onClick={() => onEdit(pago)}
            >
              <i className="fas fa-edit"></i>
            </Button>
          )}
          {onDelete && pago.estado !== 'completado' && (
            <Button
              variant="outline-danger"
              size="sm"
              title="Eliminar"
              onClick={() => onDelete(pago.id)}
            >
              <i className="fas fa-trash"></i>
            </Button>
          )}
        </div>
      )
    }
  ];

  const handleViewDetails = (pago) => {
    setSelectedPago(pago);
    setShowDetalleModal(true);
  };

  if (loading) {
    return (
      <div className="p-4 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p className="mt-2 text-muted">Cargando pagos...</p>
      </div>
    );
  }

  if (!pagos || pagos.length === 0) {
    return (
      <div className="p-4">
        <div className="text-center py-5">
          <i className="fas fa-money-bill-wave fa-3x text-muted mb-3"></i>
          <h5 className="text-muted">No hay pagos registrados</h5>
          <p className="text-muted">
            No se encontraron pagos con los filtros aplicados.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="table-responsive">
        <Table
          columns={columns}
          data={pagos}
          striped
          hover
        />
      </div>

      {/* Información de paginación */}
      <div className="d-flex justify-content-between align-items-center p-3 border-top">
        <div className="text-muted">
          Mostrando {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} a {' '}
          {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} de {' '}
          {pagination.totalItems} registros
        </div>
        
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={onPageChange}
          showFirstLast
        />
      </div>

      {/* Modal de detalles */}
      <PagoDetalleModal
        pago={selectedPago}
        show={showDetalleModal}
        onHide={() => {
          setShowDetalleModal(false);
          setSelectedPago(null);
        }}
      />
    </div>
  );
};

export default PagosTable;