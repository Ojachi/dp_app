import React, { useState, useEffect } from 'react';
import Modal from '../../components/Modal';

const DetalleCliente = ({ 
  detalleCliente, 
  historialGestiones,
  loading, 
  clienteId, 
  onVolver,
  cargarHistorialGestiones,
  actualizarLimiteCredito,
  registrarGestionCobranza,
  enviarEstadoCuenta
}) => {
  const [showModalLimite, setShowModalLimite] = useState(false);
  const [showModalGestion, setShowModalGestion] = useState(false);
  const [nuevoLimite, setNuevoLimite] = useState('');
  const [observacionesLimite, setObservacionesLimite] = useState('');
  const [nuevaGestion, setNuevaGestion] = useState({
    tipo: 'Llamada telefónica',
    resultado: '',
    observaciones: ''
  });

  useEffect(() => {
    if (clienteId && !loading) {
      cargarHistorialGestiones(clienteId);
    }
  }, [clienteId, loading, cargarHistorialGestiones]);

  useEffect(() => {
    if (detalleCliente) {
      setNuevoLimite(detalleCliente.limiteCredito.toString());
    }
  }, [detalleCliente]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-CO');
  };

  const handleActualizarLimite = async () => {
    try {
      await actualizarLimiteCredito(clienteId, parseFloat(nuevoLimite), observacionesLimite);
      setShowModalLimite(false);
      setObservacionesLimite('');
      alert('Límite de crédito actualizado exitosamente');
    } catch (error) {
      alert('Error al actualizar límite: ' + error.message);
    }
  };

  const handleRegistrarGestion = async () => {
    try {
      await registrarGestionCobranza(clienteId, nuevaGestion);
      setShowModalGestion(false);
      setNuevaGestion({
        tipo: 'Llamada telefónica',
        resultado: '',
        observaciones: ''
      });
      alert('Gestión registrada exitosamente');
    } catch (error) {
      alert('Error al registrar gestión: ' + error.message);
    }
  };

  if (loading || !detalleCliente) {
    return (
      <div className="d-flex justify-content-center py-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando detalle...</span>
        </div>
      </div>
    );
  }

  const porcentajeUsoCredito = (detalleCliente.totalDeuda / detalleCliente.limiteCredito) * 100;
  const facturaVencida = detalleCliente.facturas?.find(f => f.estado === 'Vencida');

  return (
    <div>
      {/* Header con navegación */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center">
          <button
            className="btn btn-outline-secondary me-3"
            onClick={onVolver}
          >
            <i className="fas fa-arrow-left me-1"></i>
            Volver
          </button>
          <div>
            <h4 className="mb-0">{detalleCliente.cliente}</h4>
            <small className="text-muted">{detalleCliente.ruc}</small>
          </div>
        </div>
        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-primary"
            onClick={() => enviarEstadoCuenta(clienteId)}
          >
            <i className="fas fa-envelope me-1"></i>
            Enviar Estado
          </button>
          <button
            className="btn btn-outline-warning"
            onClick={() => setShowModalLimite(true)}
          >
            <i className="fas fa-edit me-1"></i>
            Actualizar Límite
          </button>
          <button
            className="btn btn-primary"
            onClick={() => setShowModalGestion(true)}
          >
            <i className="fas fa-plus me-1"></i>
            Registrar Gestión
          </button>
        </div>
      </div>

      <div className="row">
        {/* Información del cliente */}
        <div className="col-lg-4 mb-4">
          <div className="card h-100">
            <div className="card-header">
              <h6 className="mb-0">
                <i className="fas fa-building text-primary me-2"></i>
                Información del Cliente
              </h6>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="small text-muted">RUC/NIT</label>
                <div className="fw-semibold">{detalleCliente.ruc}</div>
              </div>
              <div className="mb-3">
                <label className="small text-muted">Teléfono</label>
                <div className="fw-semibold">{detalleCliente.telefono}</div>
              </div>
              <div className="mb-3">
                <label className="small text-muted">Email</label>
                <div className="fw-semibold">{detalleCliente.email}</div>
              </div>
              <div className="mb-3">
                <label className="small text-muted">Historial de Pagos</label>
                <div>
                  <span className={`badge ${
                    detalleCliente.historialPagos === 'Excelente' ? 'bg-success' :
                    detalleCliente.historialPagos === 'Bueno' || detalleCliente.historialPagos === 'Buen pagador' ? 'bg-primary' :
                    'bg-warning'
                  }`}>
                    {detalleCliente.historialPagos}
                  </span>
                </div>
              </div>
              <div className="mb-3">
                <label className="small text-muted">Estado Actual</label>
                <div>
                  <span className={`badge ${
                    detalleCliente.estado === 'En mora' ? 'bg-danger' : 'bg-success'
                  }`}>
                    {detalleCliente.estado}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Resumen financiero */}
        <div className="col-lg-8 mb-4">
          <div className="card h-100">
            <div className="card-header">
              <h6 className="mb-0">
                <i className="fas fa-chart-bar text-success me-2"></i>
                Resumen Financiero
              </h6>
            </div>
            <div className="card-body">
              <div className="row mb-4">
                <div className="col-md-3">
                  <div className="text-center">
                    <div className="h4 mb-1">{formatCurrency(detalleCliente.totalDeuda)}</div>
                    <small className="text-muted">Deuda Total</small>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="text-center">
                    <div className="h4 mb-1">{formatCurrency(detalleCliente.limiteCredito)}</div>
                    <small className="text-muted">Límite de Crédito</small>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="text-center">
                    <div className="h4 mb-1 text-info">{detalleCliente.facturasPendientes}</div>
                    <small className="text-muted">Facturas Pendientes</small>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="text-center">
                    <div className="h4 mb-1">
                      {formatCurrency(detalleCliente.limiteCredito - detalleCliente.totalDeuda)}
                    </div>
                    <small className="text-muted">Crédito Disponible</small>
                  </div>
                </div>
              </div>

              {/* Barra de uso de crédito */}
              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="fw-semibold">Uso del Límite de Crédito</span>
                  <span className="fw-semibold">{porcentajeUsoCredito.toFixed(1)}%</span>
                </div>
                <div className="progress" style={{ height: '12px' }}>
                  <div 
                    className={`progress-bar ${
                      porcentajeUsoCredito > 90 ? 'bg-danger' :
                      porcentajeUsoCredito > 75 ? 'bg-warning' :
                      'bg-success'
                    }`}
                    style={{ width: `${Math.min(porcentajeUsoCredito, 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Alerta de factura vencida */}
              {facturaVencida && (
                <div className="alert alert-danger" role="alert">
                  <div className="d-flex align-items-center">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    <div>
                      <strong>Factura Vencida: </strong>
                      {facturaVencida.numero} - {formatCurrency(facturaVencida.monto)}
                      <br />
                      <small>
                        Vencida hace {facturaVencida.diasVencido} días 
                        (Vencimiento: {formatDate(facturaVencida.vencimiento)})
                      </small>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Facturas pendientes */}
        <div className="col-lg-7 mb-4">
          <div className="card h-100">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h6 className="mb-0">
                <i className="fas fa-file-invoice text-warning me-2"></i>
                Facturas Pendientes
              </h6>
              <span className="badge bg-warning">{detalleCliente.facturas?.length || 0} facturas</span>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Número</th>
                      <th>Fecha</th>
                      <th>Vencimiento</th>
                      <th>Monto</th>
                      <th>Estado</th>
                      <th>Días</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detalleCliente.facturas?.map((factura) => (
                      <tr key={factura.numero}>
                        <td className="fw-semibold">{factura.numero}</td>
                        <td>{formatDate(factura.fecha)}</td>
                        <td>{formatDate(factura.vencimiento)}</td>
                        <td className="fw-semibold">{formatCurrency(factura.monto)}</td>
                        <td>
                          <span className={`badge ${
                            factura.estado === 'Vencida' ? 'bg-danger' : 'bg-warning'
                          }`}>
                            {factura.estado}
                          </span>
                        </td>
                        <td>
                          {factura.diasVencido > 0 ? (
                            <span className="text-danger fw-semibold">
                              {factura.diasVencido} días
                            </span>
                          ) : (
                            <span className="text-success">--</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Historial de pagos recientes */}
        <div className="col-lg-5 mb-4">
          <div className="card h-100">
            <div className="card-header">
              <h6 className="mb-0">
                <i className="fas fa-history text-success me-2"></i>
                Pagos Recientes
              </h6>
            </div>
            <div className="card-body">
              {detalleCliente.pagos?.length > 0 ? (
                detalleCliente.pagos.map((pago, index) => (
                  <div key={index} className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-2">
                    <div>
                      <div className="fw-semibold">{formatDate(pago.fecha)}</div>
                      <small className="text-muted">{pago.factura} - {pago.metodo}</small>
                      <br />
                      <small className="text-muted">Ref: {pago.referencia}</small>
                    </div>
                    <div className="text-end">
                      <div className="fw-semibold text-success">
                        {formatCurrency(pago.monto)}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted">No hay pagos registrados</p>
              )}
            </div>
          </div>
        </div>

        {/* Historial de gestiones */}
        <div className="col-12">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h6 className="mb-0">
                <i className="fas fa-tasks text-info me-2"></i>
                Historial de Gestiones de Cobranza
              </h6>
              <span className="badge bg-info">{historialGestiones?.length || 0} gestiones</span>
            </div>
            <div className="card-body">
              {historialGestiones?.length > 0 ? (
                <div className="timeline">
                  {historialGestiones.map((gestion, index) => (
                    <div key={gestion.id} className="d-flex mb-3">
                      <div className="flex-shrink-0">
                        <div className={`rounded-circle d-flex align-items-center justify-content-center ${
                          gestion.tipo === 'Llamada telefónica' ? 'bg-primary' :
                          gestion.tipo === 'Email' ? 'bg-info' :
                          gestion.tipo === 'Visita comercial' ? 'bg-success' :
                          'bg-secondary'
                        } text-white`} style={{ width: '40px', height: '40px' }}>
                          <i className={`fas ${
                            gestion.tipo === 'Llamada telefónica' ? 'fa-phone' :
                            gestion.tipo === 'Email' ? 'fa-envelope' :
                            gestion.tipo === 'Visita comercial' ? 'fa-handshake' :
                            'fa-comment'
                          }`}></i>
                        </div>
                      </div>
                      <div className="flex-grow-1 ms-3">
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <h6 className="mb-1">{gestion.tipo}</h6>
                            <p className="mb-1">{gestion.observaciones}</p>
                            <small className="text-muted">
                              Resultado: <span className="fw-semibold">{gestion.resultado}</span>
                            </small>
                          </div>
                          <div className="text-end">
                            <small className="text-muted d-block">{formatDate(gestion.fecha)}</small>
                            <small className="text-muted">por {gestion.usuario}</small>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted text-center py-4">
                  No hay gestiones de cobranza registradas para este cliente
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal para actualizar límite de crédito */}
      <Modal
        isOpen={showModalLimite}
        onClose={() => setShowModalLimite(false)}
        title="Actualizar Límite de Crédito"
        size="md"
      >
        <div className="mb-3">
          <label className="form-label">Nuevo Límite de Crédito</label>
          <input
            type="number"
            className="form-control"
            value={nuevoLimite}
            onChange={(e) => setNuevoLimite(e.target.value)}
            placeholder="Ingrese el nuevo límite"
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Observaciones</label>
          <textarea
            className="form-control"
            rows="3"
            value={observacionesLimite}
            onChange={(e) => setObservacionesLimite(e.target.value)}
            placeholder="Motivo del cambio de límite..."
          ></textarea>
        </div>
        <div className="d-flex justify-content-end gap-2">
          <button
            className="btn btn-secondary"
            onClick={() => setShowModalLimite(false)}
          >
            Cancelar
          </button>
          <button
            className="btn btn-primary"
            onClick={handleActualizarLimite}
            disabled={!nuevoLimite}
          >
            Actualizar Límite
          </button>
        </div>
      </Modal>

      {/* Modal para registrar gestión */}
      <Modal
        isOpen={showModalGestion}
        onClose={() => setShowModalGestion(false)}
        title="Registrar Gestión de Cobranza"
        size="lg"
      >
        <div className="row">
          <div className="col-md-6 mb-3">
            <label className="form-label">Tipo de Gestión</label>
            <select
              className="form-select"
              value={nuevaGestion.tipo}
              onChange={(e) => setNuevaGestion({...nuevaGestion, tipo: e.target.value})}
            >
              <option value="Llamada telefónica">Llamada telefónica</option>
              <option value="Email">Email</option>
              <option value="Visita comercial">Visita comercial</option>
              <option value="WhatsApp">WhatsApp</option>
              <option value="Carta formal">Carta formal</option>
            </select>
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label">Resultado</label>
            <select
              className="form-select"
              value={nuevaGestion.resultado}
              onChange={(e) => setNuevaGestion({...nuevaGestion, resultado: e.target.value})}
            >
              <option value="">Seleccionar resultado</option>
              <option value="Compromiso de pago">Compromiso de pago</option>
              <option value="Plan de pagos acordado">Plan de pagos acordado</option>
              <option value="Sin respuesta">Sin respuesta</option>
              <option value="Cliente no disponible">Cliente no disponible</option>
              <option value="Disputa comercial">Disputa comercial</option>
              <option value="Pago realizado">Pago realizado</option>
            </select>
          </div>
        </div>
        <div className="mb-3">
          <label className="form-label">Observaciones Detalladas</label>
          <textarea
            className="form-control"
            rows="4"
            value={nuevaGestion.observaciones}
            onChange={(e) => setNuevaGestion({...nuevaGestion, observaciones: e.target.value})}
            placeholder="Describa los detalles de la gestión realizada..."
          ></textarea>
        </div>
        <div className="d-flex justify-content-end gap-2">
          <button
            className="btn btn-secondary"
            onClick={() => setShowModalGestion(false)}
          >
            Cancelar
          </button>
          <button
            className="btn btn-primary"
            onClick={handleRegistrarGestion}
            disabled={!nuevaGestion.resultado || !nuevaGestion.observaciones}
          >
            Registrar Gestión
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default DetalleCliente;