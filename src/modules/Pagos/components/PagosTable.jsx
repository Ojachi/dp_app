import React from 'react';
import { useAuth } from '../../../context/AuthContext';
import { pagosService } from '../../../services/pagosService';
import { useToast } from '../../../components/Toast';
import { Table } from '../../../components/Table';
import { Pagination } from '../../../components/Pagination';
import { Button } from '../../../components/Button';

const PagosTable = ({
  pagos,
  loading,
  pagination,
  onPageChange,
  onView,
  onEdit,
  onDelete,
}) => {
  const { hasRole } = useAuth();
  const { toast } = useToast();
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) {
      return 'Sin fecha';
    }
    return new Date(dateString).toLocaleDateString('es-CO');
  };

  const columns = [
    {
      key: 'codigo',
      header: 'Código',
      render: (pago) => (
        <div>
          <div className="fw-medium">
            {pago.codigo}
          </div>
          <small className="text-muted">
            Pago realizado el {formatDate(pago.fecha_pago)}
          </small>
        </div>
      )
    },
    {
      key: 'registro',
      header: 'Registro',
      render: (pago) => (
        <div>
          <div>{formatDate(pago.fecha_registro)}</div>
          <small className="text-muted">por {pago.usuario_nombre || 'N/D'}</small>
        </div>
      )
    },
    {
      key: 'cliente',
      header: 'Cliente',
      render: (pago) => (
        <div>
          <div className="fw-medium">{pago.cliente_nombre || pago.factura?.cliente?.nombre || 'N/D'}</div>
          {pago.cliente_codigo && (
            <small className="text-muted">Código: {pago.cliente_codigo}</small>
          )}
        </div>
      )
    },
    {
      key: 'valor',
      header: 'Aplicado',
      render: (pago) => {
        const valor = Number(pago.valor_pagado || pago.monto || 0);
        const descuento = Number(pago.descuento || 0);
        const retencion = Number(pago.retencion || 0);
        const ica = Number(pago.ica || 0);
        const nota = Number(pago.nota || 0);
        const totalAplicado = valor + descuento + retencion + ica + nota;
        const aplicado = pago.aplicado ?? (pago.estado === 'confirmado');
        return (
          <div className="text-end">
            <div className="fw-bold text-success">{formatCurrency(totalAplicado)}</div>
            <div>
              <span className={`badge bg-${aplicado ? 'success' : 'secondary'}`}>{aplicado ? 'Aplicado' : 'Pendiente'}</span>
            </div>
            {(descuento || retencion || ica || nota) ? (
              <small className="text-muted d-block">
                {valor ? `Pago ${formatCurrency(valor)}` : ''}
                {descuento ? `, Desc. ${formatCurrency(descuento)}` : ''}
                {retencion ? `, Ret. ${formatCurrency(retencion)}` : ''}
                {ica ? `, ICA ${formatCurrency(ica)}` : ''}
                {nota ? `, Nota ${formatCurrency(nota)}` : ''}
              </small>
            ) : null}
          </div>
        );
      }
    },
    {
      key: 'tipo_pago',
      header: 'Tipo de pago',
      render: (pago) => (
        <div className="d-flex align-items-center gap-2">
          <span className="text-capitalize">{pago.tipo_pago_nombre || pago.tipo_pago || 'Sin dato'}</span>
          {pago.estado && (
            <span className={`badge bg-${pago.estado === 'confirmado' ? 'success' : pago.estado === 'registrado' ? 'warning text-dark' : 'secondary'}`}>
              {pago.estado}
            </span>
          )}
        </div>
      )
    },
    {
      key: 'cuenta',
      header: 'Cuenta',
      render: (pago) => pago.cuenta_nombre ? (
        <span>{pago.cuenta_nombre}</span>
      ) : (pago.cuenta || '—')
    },
    {
      key: 'comprobante',
      header: 'Comprobante',
      render: (pago) => (
        <div>
          {pago.tiene_comprobante ? (
            <span className="badge bg-info">Adjunto</span>
          ) : '—'}
          {pago.numero_comprobante ? (
            <small className="text-muted d-block">Ref: {pago.numero_comprobante}</small>
          ) : null}
        </div>
      ),
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
            onClick={() => onView?.(pago.id)}
          >
            <i className="fas fa-eye"></i>
          </Button>
          {hasRole('gerente') && pago.estado === 'registrado' && (
            <Button
              variant="outline-success"
              size="sm"
              title="Confirmar pago"
              onClick={async () => {
                try {
                  await pagosService.confirmPago(pago.id);
                  toast.success('Pago confirmado');
                  onPageChange?.(pagination.currentPage);
                } catch (e) {
                  toast.error(e.message || 'No se pudo confirmar el pago');
                }
              }}
            >
              <i className="fas fa-check"></i>
            </Button>
          )}
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
          {onDelete && (
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
        <Table columns={columns} data={pagos} striped hover />
      </div>

      <div className="d-flex justify-content-between align-items-center p-3 border-top">
        <div className="text-muted">
          Mostrando {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} a{' '}
          {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} de{' '}
          {pagination.totalItems} registros
        </div>

        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={onPageChange}
          showFirstLast
        />
      </div>
    </div>
  );
};

export default PagosTable;