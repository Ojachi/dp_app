/**
 * AlertasList - Presenta las alertas en un formato compacto orientado a lectura
 */
import React from 'react';
import Button from '../../components/Button';
import LoadingSpinner from '../../components/LoadingSpinner';

const formatFecha = (fecha) => {
  if (!fecha) {
    return 'Sin fecha';
  }

  return new Date(fecha).toLocaleString('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const prioridadBadge = (prioridad) => {
  const mapaColores = {
    critica: 'danger',
    alta: 'warning',
    media: 'info',
    baja: 'secondary'
  };

  const color = mapaColores[prioridad?.toLowerCase()] || 'secondary';
  const label = prioridad ? prioridad.charAt(0).toUpperCase() + prioridad.slice(1) : 'N/A';

  return <span className={`badge bg-${color} me-2`}>{label}</span>;
};

const tipoBadge = (tipo) => {
  const mapaColores = {
    sistema: 'primary',
    factura: 'success',
    pago: 'info',
    cartera: 'warning',
    importacion: 'secondary'
  };

  const color = mapaColores[tipo?.toLowerCase()] || 'light';
  const label = tipo ? tipo.charAt(0).toUpperCase() + tipo.slice(1) : 'Sin tipo';

  return <span className={`badge bg-${color} text-dark`}>{label}</span>;
};

const AlertasList = ({
  alertas,
  loading,
  onToggleLectura,
  onEliminar,
  canManage
}) => {
  return (
    <div className="card">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="card-title mb-0">
          <i className="bi bi-bell me-2"></i>
          Alertas registradas
        </h5>
        <span className="badge bg-secondary">{alertas.length}</span>
      </div>

      {loading && (
        <div className="card-body">
          <LoadingSpinner message="Cargando alertas..." />
        </div>
      )}

      {!loading && alertas.length === 0 && (
        <div className="card-body text-center text-muted py-5">
          <i className="bi bi-inbox me-2"></i>
          No hay alertas registradas.
        </div>
      )}

      {!loading && alertas.length > 0 && (
        <div className="list-group list-group-flush">
          {alertas.map((alerta) => (
            <div
              key={alerta.id}
              className={`list-group-item d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 ${alerta.leida ? '' : 'list-group-item-warning'}`}
            >
              <div className="flex-grow-1">
                <div className="d-flex align-items-center mb-1">
                  {prioridadBadge(alerta.prioridad)}
                  {tipoBadge(alerta.tipo)}
                </div>
                <h6 className={`mb-1 ${alerta.leida ? 'fw-normal' : 'fw-semibold'}`}>
                  {alerta.titulo}
                </h6>
                {alerta.mensaje && (
                  <p className="mb-2 text-muted small">
                    {alerta.mensaje}
                  </p>
                )}
                <div className="small text-muted">
                  <i className="bi bi-calendar-event me-1"></i>
                  Creada: {formatFecha(alerta.created_at)}
                  {alerta.fecha_leida && (
                    <span className="ms-3">
                      <i className="bi bi-check2-circle me-1"></i>
                      Leída: {formatFecha(alerta.fecha_leida)}
                    </span>
                  )}
                </div>
              </div>

              <div className="d-flex flex-wrap gap-2 justify-content-start justify-content-md-end">
                <Button
                  variant={alerta.leida ? 'outline-secondary' : 'outline-success'}
                  size="sm"
                  onClick={() => onToggleLectura(alerta)}
                >
                  {alerta.leida ? 'Marcar como no leída' : 'Marcar como leída'}
                </Button>
                {canManage && (
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => onEliminar(alerta.id)}
                  >
                    Eliminar
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AlertasList;