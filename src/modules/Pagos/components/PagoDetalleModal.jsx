/**
 * Modal para mostrar detalles de un pago
 */
import React from 'react';
import Modal from '../../../components/Modal';
import LoadingSpinner from '../../../components/LoadingSpinner';

const PagoDetalleModal = ({ pago, show, onHide, loading }) => {
  if (!show) {
    return null;
  }

  const formatCurrency = (value) => new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(value ?? 0);

  const formatDate = (value) => value
    ? new Date(value).toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : 'Sin fecha';

  const formatDateTime = (value) => value
    ? new Date(value).toLocaleString('es-CO')
    : 'Sin registro';

  const clienteNombre = pago?.factura?.cliente_nombre|| pago?.cliente_nombre || 'Sin dato';
  const handleVerComprobante = () => {
    if (!pago) return;
    try {
      if (pago.comprobante_b64) {
        const base64 = pago.comprobante_b64;
        // Decodificar base64 a bytes
        const byteCharacters = atob(base64);
        const len = byteCharacters.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) bytes[i] = byteCharacters.charCodeAt(i);
        // Intento simple de detectar tipo
        let type = 'application/pdf';
        if (len >= 4 && byteCharacters.slice(0, 4) === '%PDF') type = 'application/pdf';
        else if (len >= 4 && bytes[0] === 0x89 && byteCharacters.slice(1, 4) === 'PNG') type = 'image/png';
        else if (len >= 2 && bytes[0] === 0xff && bytes[1] === 0xd8) type = 'image/jpeg';
        const blob = new Blob([bytes], { type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.download = `comprobante_${pago.codigo || pago.id || ''}`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 2000);
      }
    } catch (e) {
      console.error('No se pudo abrir el comprobante:', e);
    }
  };
  const valor = Number(pago?.valor_pagado || pago?.monto || 0);
  const descuento = Number(pago?.descuento || 0);
  const retencion = Number(pago?.retencion || 0);
  const ica = Number(pago?.ica || 0);
  const nota = Number(pago?.nota || 0);
  const totalAplicado = valor + descuento + retencion + ica + nota;
  const aplicado = pago?.aplicado ?? (pago?.estado === 'confirmado');

  return (
    <Modal show={show} onHide={onHide} title="Detalle del Pago" size="lg">
      {loading ? (
        <div className="text-center py-5">
          <LoadingSpinner className="mb-3" />
          <p className="text-muted">Cargando detalle del pago…</p>
        </div>
      ) : !pago ? (
        <div className="text-center py-4 text-muted">
          No encontramos información del pago.
        </div>
      ) : (
        <>
          <div className="row g-3">
            <div className="col-12">
              <div className="card bg-light">
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-6">
                      <h6 className="text-muted mb-2">Pago</h6>
                      <div className="mb-2">
                        <strong>Código:</strong> {pago.codigo || '—'}
                      </div>
                      <div className="mb-2">
                        <strong>Factura:</strong> {pago.factura_numero || pago.factura?.numero_factura || pago.factura}
                      </div>
                      <div className="mb-2">
                        <strong>Cliente:</strong> {pago.cliente_codigo || 'Sin código'} - {clienteNombre}
                      </div>
                      <div className="mb-2">
                        <strong>Fecha Pago:</strong> {formatDate(pago.fecha_pago)}
                      </div>
                      <div className="mb-2">
                        <strong>Registro (sistema):</strong> {formatDateTime(pago.fecha_registro)}
                      </div>
                      {pago.estado && (
                        <div className="mb-2">
                          <strong>Estado:</strong>{' '}
                          <span className={`badge bg-${pago.estado === 'confirmado' ? 'success' : pago.estado === 'registrado' ? 'warning text-dark' : 'secondary'}`}>
                            {pago.estado}
                          </span>
                        </div>
                      )}
                      <div className="mb-2">
                        <strong>Aplicación:</strong>{' '}
                        <span className={`badge bg-${aplicado ? 'success' : 'secondary'}`}>{aplicado ? 'Aplicado' : 'Pendiente'}</span>
                      </div>
                      <div className="mb-2">
                        <strong>Total aplicado:</strong>{' '}
                        <span className="text-success fw-bold">{formatCurrency(totalAplicado)}</span>
                      </div>
                      <div className="mb-2">
                        <small className="text-muted">
                          {valor ? `Pago ${formatCurrency(valor)}` : ''}
                          {descuento ? `, Desc. ${formatCurrency(descuento)}` : ''}
                          {retencion ? `, Ret. ${formatCurrency(retencion)}` : ''}
                          {ica ? `, ICA ${formatCurrency(ica)}` : ''}
                          {nota ? `, Nota ${formatCurrency(nota)}` : ''}
                        </small>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <h6 className="text-muted mb-2">Medio de pago</h6>
                      <div className="mb-2">
                        <strong>Tipo:</strong> {pago.tipo_pago_nombre || pago.tipo_pago || 'Sin dato'}
                      </div>
                      {pago.numero_comprobante && (
                        <div className="mb-2">
                          <strong>Comprobante:</strong> {pago.numero_comprobante}
                        </div>
                      )}
                      {pago.referencia && (
                        <div className="mb-2">
                          <strong>Referencia:</strong> {pago.referencia}
                        </div>
                      )}
                      {(pago.cuenta || pago.cuenta_nombre) && (
                        <div className="mb-2">
                          <strong>Cuenta:</strong> {pago.cuenta_nombre || pago.cuenta}
                        </div>
                      )}
                      {pago.notas && (
                        <div className="mb-2">
                          <strong>Notas:</strong> {pago.notas}
                        </div>
                      )}
                      {pago.fecha_confirmacion && (
                        <div className="mb-2">
                          <strong>Confirmado:</strong> {formatDateTime(pago.fecha_confirmacion)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {pago.factura && (
              <div className="col-12">
                <div className="card">
                  <div className="card-header">
                    <h6 className="mb-0">
                      <i className="fas fa-file-invoice me-2"></i>
                      Factura asociada
                    </h6>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-6">
                        <div className="mb-2">
                          <strong>Número:</strong> {pago.factura.numero || pago.factura.numero_factura}
                        </div>
                        <div className="mb-2">
                          <strong>Cliente:</strong> {clienteNombre}
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-2">
                          <strong>Total factura:</strong> {formatCurrency(pago.factura.valor_total || pago.factura.total_factura)}
                        </div>
                        <div className="mb-2">
                          <strong>Saldo pendiente:</strong> {formatCurrency(pago.factura.saldo_pendiente)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="col-12">
              <div className="card">
                <div className="card-header">
                  <h6 className="mb-0">
                    <i className="fas fa-info-circle me-2"></i>
                    Auditoría
                  </h6>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-2">
                        <strong>Registrado por:</strong> {pago.usuario_registro_nombre || 'Sin dato'}
                      </div>
                      {pago.usuario_confirmacion_nombre && (
                        <div className="mb-2">
                          <strong>Confirmado por:</strong> {pago.usuario_confirmacion_nombre}
                        </div>
                      )}
                      <div className="mb-2">
                        <strong>Creado:</strong> {formatDateTime(pago.creado)}
                      </div>
                    </div>
                    <div className="col-md-6">
                      {pago.actualizado && (
                        <div className="mb-2">
                          <strong>Actualizado:</strong> {formatDateTime(pago.actualizado)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {pago.comprobante_b64 && (
              <div className="col-12">
                <div className="card">
                  <div className="card-body text-center">
                    <button type="button" onClick={handleVerComprobante} className="btn btn-outline-primary">
                      <i className="fas fa-download me-2"></i>
                      Ver/Descargar comprobante
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="d-flex justify-content-end mt-4">
            <button type="button" className="btn btn-secondary" onClick={onHide}>
              Cerrar
            </button>
          </div>
        </>
      )}
    </Modal>
  );
};

export default PagoDetalleModal;
