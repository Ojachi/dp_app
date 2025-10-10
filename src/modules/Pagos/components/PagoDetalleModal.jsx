/**
 * Modal para mostrar detalles de un pago
 */
import React from 'react';
import Modal from '../../../components/Modal';

const PagoDetalleModal = ({ pago, show, onHide }) => {
  if (!pago) return null;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('es-CO');
  };

  const getEstadoBadge = (estado) => {
    const estados = {
      'completado': 'success',
      'pendiente': 'warning',
      'cancelado': 'danger',
      'procesando': 'info'
    };
    
    return (
      <span className={`badge bg-${estados[estado] || 'secondary'} fs-6`}>
        {estado?.toUpperCase() || 'N/A'}
      </span>
    );
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      title={`Detalle del Pago - ${pago.numero || `P-${pago.id}`}`}
      size="lg"
    >
      <div className="row g-3">
        {/* Información principal */}
        <div className="col-12">
          <div className="card bg-light">
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <h6 className="text-muted mb-2">Información del Pago</h6>
                  <div className="mb-2">
                    <strong>Número:</strong> {pago.numero || `P-${pago.id}`}
                  </div>
                  <div className="mb-2">
                    <strong>Fecha:</strong> {formatDate(pago.fecha_pago)}
                  </div>
                  <div className="mb-2">
                    <strong>Monto:</strong> <span className="text-success fw-bold">{formatCurrency(pago.monto)}</span>
                  </div>
                  <div className="mb-2">
                    <strong>Estado:</strong> {getEstadoBadge(pago.estado)}
                  </div>
                </div>
                <div className="col-md-6">
                  <h6 className="text-muted mb-2">Método de Pago</h6>
                  <div className="mb-2">
                    <strong>Método:</strong> {pago.metodo_pago_display || pago.metodo_pago}
                  </div>
                  {pago.referencia && (
                    <div className="mb-2">
                      <strong>Referencia:</strong> {pago.referencia}
                    </div>
                  )}
                  {pago.banco && (
                    <div className="mb-2">
                      <strong>Banco:</strong> {pago.banco}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Información de la factura */}
        {pago.factura && (
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h6 className="mb-0">
                  <i className="fas fa-file-invoice me-2"></i>
                  Factura Asociada
                </h6>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-2">
                      <strong>Número:</strong> {pago.factura.numero}
                    </div>
                    <div className="mb-2">
                      <strong>Cliente:</strong> {pago.factura.cliente?.nombre || 'N/A'}
                    </div>
                    {pago.factura.cliente?.email && (
                      <div className="mb-2">
                        <strong>Email:</strong> {pago.factura.cliente.email}
                      </div>
                    )}
                  </div>
                  <div className="col-md-6">
                    <div className="mb-2">
                      <strong>Total factura:</strong> {formatCurrency(pago.factura.total || 0)}
                    </div>
                    <div className="mb-2">
                      <strong>Saldo pendiente:</strong> {formatCurrency(pago.factura.saldo_pendiente || 0)}
                    </div>
                    {pago.monto_aplicado && pago.monto_aplicado !== pago.monto && (
                      <div className="mb-2">
                        <strong>Monto aplicado:</strong> {formatCurrency(pago.monto_aplicado)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Observaciones */}
        {pago.observaciones && (
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h6 className="mb-0">
                  <i className="fas fa-comment me-2"></i>
                  Observaciones
                </h6>
              </div>
              <div className="card-body">
                <p className="mb-0">{pago.observaciones}</p>
              </div>
            </div>
          </div>
        )}

        {/* Información de auditoría */}
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h6 className="mb-0">
                <i className="fas fa-info-circle me-2"></i>
                Información de Auditoría
              </h6>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <div className="mb-2">
                    <strong>Registrado por:</strong> {pago.usuario?.full_name || pago.usuario?.email || 'N/A'}
                  </div>
                  <div className="mb-2">
                    <strong>Fecha de registro:</strong> {formatDateTime(pago.created_at || pago.fecha_creacion)}
                  </div>
                </div>
                <div className="col-md-6">
                  {pago.updated_at && (
                    <div className="mb-2">
                      <strong>Última modificación:</strong> {formatDateTime(pago.updated_at)}
                    </div>
                  )}
                  {pago.ip_registro && (
                    <div className="mb-2">
                      <strong>IP de registro:</strong> {pago.ip_registro}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Acciones adicionales */}
        {pago.comprobante_url && (
          <div className="col-12">
            <div className="card">
              <div className="card-body text-center">
                <a
                  href={pago.comprobante_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline-primary"
                >
                  <i className="fas fa-download me-2"></i>
                  Descargar Comprobante
                </a>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="d-flex justify-content-end mt-4">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onHide}
        >
          Cerrar
        </button>
      </div>
    </Modal>
  );
};

export default PagoDetalleModal;