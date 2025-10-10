/**
 * AlertasList - Lista de alertas con funcionalidades completas
 */
import React from 'react';
import Table from '../../components/Table';
import Button from '../../components/Button';
import Checkbox from '../../components/Checkbox';

const AlertasList = ({
  alertas,
  loading,
  selectedAlertas,
  onSelectAlerta,
  onSelectAll,
  onMarcarLeida,
  onEditar,
  onEliminar,
  canEdit = false,
  canDelete = false
}) => {

  // Función para obtener el badge de prioridad
  const getPrioridadBadge = (prioridad) => {
    const colores = {
      alta: 'danger',
      media: 'warning',
      baja: 'info'
    };
    return (
      <span className={`badge bg-${colores[prioridad?.toLowerCase()] || 'secondary'}`}>
        {prioridad?.charAt(0).toUpperCase() + prioridad?.slice(1) || 'N/A'}
      </span>
    );
  };

  // Función para obtener el badge de tipo
  const getTipoBadge = (tipo) => {
    const colores = {
      sistema: 'primary',
      factura: 'success',
      pago: 'info',
      cartera: 'warning',
      importacion: 'secondary'
    };
    return (
      <span className={`badge bg-${colores[tipo?.toLowerCase()] || 'light'} text-dark`}>
        {tipo?.charAt(0).toUpperCase() + tipo?.slice(1) || 'N/A'}
      </span>
    );
  };

  // Función para formatear fecha
  const formatFecha = (fecha) => {
    if (!fecha) return 'N/A';
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Configuración de columnas
  const columns = [
    {
      key: 'select',
      header: (
        <Checkbox
          checked={selectedAlertas.length === alertas.length && alertas.length > 0}
          indeterminate={selectedAlertas.length > 0 && selectedAlertas.length < alertas.length}
          onChange={(e) => onSelectAll(e.target.checked)}
        />
      ),
      render: (alerta) => (
        <Checkbox
          checked={selectedAlertas.includes(alerta.id)}
          onChange={(e) => onSelectAlerta(alerta.id, e.target.checked)}
        />
      ),
      width: '50px'
    },
    {
      key: 'status',
      header: '',
      render: (alerta) => (
        <div className="text-center">
          {!alerta.leida && (
            <span className="badge bg-danger rounded-pill" title="No leída">●</span>
          )}
        </div>
      ),
      width: '30px'
    },
    {
      key: 'prioridad',
      header: 'Prioridad',
      render: (alerta) => getPrioridadBadge(alerta.prioridad),
      width: '100px'
    },
    {
      key: 'tipo',
      header: 'Tipo',
      render: (alerta) => getTipoBadge(alerta.tipo),
      width: '120px'
    },
    {
      key: 'titulo',
      header: 'Título',
      render: (alerta) => (
        <div>
          <div className={`fw-${alerta.leida ? 'normal' : 'bold'}`}>
            {alerta.titulo}
          </div>
          {alerta.mensaje && (
            <small className="text-muted">
              {alerta.mensaje.length > 100 
                ? `${alerta.mensaje.substring(0, 100)}...`
                : alerta.mensaje
              }
            </small>
          )}
        </div>
      )
    },
    {
      key: 'usuario_destino',
      header: 'Destinatario',
      render: (alerta) => alerta.usuario_destino_nombre || 'Sistema',
      width: '150px'
    },
    {
      key: 'created_at',
      header: 'Fecha Creación',
      render: (alerta) => formatFecha(alerta.created_at),
      width: '140px'
    },
    {
      key: 'fecha_leida',
      header: 'Fecha Leída',
      render: (alerta) => alerta.fecha_leida ? formatFecha(alerta.fecha_leida) : '-',
      width: '140px'
    },
    {
      key: 'acciones',
      header: 'Acciones',
      render: (alerta) => (
        <div className="d-flex gap-1">
          {/* Marcar como leída/no leída */}
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => onMarcarLeida(alerta.id)}
            title={alerta.leida ? 'Marcar como no leída' : 'Marcar como leída'}
          >
            <i className={`bi bi-${alerta.leida ? 'envelope' : 'envelope-open'}`}></i>
          </Button>

          {/* Editar (solo gerentes) */}
          {canEdit && (
            <Button
              variant="outline-primary"
              size="sm"
              onClick={() => onEditar(alerta)}
              title="Editar alerta"
            >
              <i className="bi bi-pencil"></i>
            </Button>
          )}

          {/* Eliminar (solo gerentes) */}
          {canDelete && (
            <Button
              variant="outline-danger"
              size="sm"
              onClick={() => onEliminar(alerta.id)}
              title="Eliminar alerta"
            >
              <i className="bi bi-trash"></i>
            </Button>
          )}
        </div>
      ),
      width: '120px'
    }
  ];

  return (
    <div className="card">
      <div className="card-header">
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="card-title mb-0">
            <i className="bi bi-list-ul me-2"></i>
            Listado de Alertas
          </h5>
          <span className="badge bg-secondary">
            {alertas.length} alertas
          </span>
        </div>
      </div>

      <div className="card-body p-0">
        <Table
          columns={columns}
          data={alertas}
          loading={loading}
          emptyMessage="No se encontraron alertas"
          responsive
          hover
          className="mb-0"
        />
      </div>

      {/* Información adicional */}
      {alertas.length > 0 && (
        <div className="card-footer text-muted">
          <div className="row">
            <div className="col-md-6">
              <small>
                <i className="bi bi-info-circle me-1"></i>
                Seleccionadas: {selectedAlertas.length} de {alertas.length}
              </small>
            </div>
            <div className="col-md-6 text-end">
              <small>
                <i className="bi bi-circle-fill text-danger me-1"></i>
                No leídas: {alertas.filter(a => !a.leida).length}
              </small>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlertasList;