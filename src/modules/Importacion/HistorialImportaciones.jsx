import React, { useState } from 'react';
import SearchBar from '../../components/SearchBar';
import FiltersSidebar from '../../components/FiltersSidebar';
import Table from '../../components/Table';
import Modal from '../../components/Modal';

const HistorialImportaciones = ({
  historialImportaciones,
  filtros,
  loading,
  actualizarFiltros,
  limpiarFiltros,
  cargarDetalleErrores,
  detalleErrores
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [showModalErrores, setShowModalErrores] = useState(false);
  const [selectedImportacion, setSelectedImportacion] = useState(null);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('es-CO');
  };

  const formatDuration = (milliseconds) => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${seconds}s`;
  };

  const handleSearch = (searchTerm) => {
    actualizarFiltros({ usuario: searchTerm });
  };

  const handleFilterChange = (filterName, value) => {
    actualizarFiltros({ [filterName]: value });
  };

  const handleVerErrores = async (importacion) => {
    if (importacion.registrosErroneos > 0) {
      setSelectedImportacion(importacion);
      await cargarDetalleErrores(importacion.id);
      setShowModalErrores(true);
    }
  };

  const getEstadoBadgeClass = (estado) => {
    switch (estado) {
      case 'Completada':
        return 'bg-success';
      case 'Completada con errores':
        return 'bg-warning text-dark';
      case 'Fallida':
        return 'bg-danger';
      case 'En progreso':
        return 'bg-info';
      default:
        return 'bg-secondary';
    }
  };

  const filterOptions = [
    {
      name: 'estado',
      label: 'Estado',
      type: 'select',
      options: [
        { value: '', label: 'Todos los estados' },
        { value: 'Completada', label: 'Completada' },
        { value: 'Completada con errores', label: 'Completada con errores' },
        { value: 'Fallida', label: 'Fallida' },
        { value: 'En progreso', label: 'En progreso' }
      ],
      value: filtros.estado
    },
    {
      name: 'fechaDesde',
      label: 'Fecha desde',
      type: 'date',
      value: filtros.fechaDesde
    },
    {
      name: 'fechaHasta',
      label: 'Fecha hasta',
      type: 'date',
      value: filtros.fechaHasta
    }
  ];

  const columns = [
    {
      key: 'fechaImportacion',
      label: 'Fecha y Hora',
      render: (importacion) => (
        <div>
          <div className="fw-semibold">{formatDate(importacion.fechaImportacion)}</div>
          <small className="text-muted">ID: {importacion.id}</small>
        </div>
      )
    },
    {
      key: 'nombreArchivo',
      label: 'Archivo',
      render: (importacion) => (
        <div>
          <div className="fw-semibold">{importacion.nombreArchivo}</div>
          <small className="text-muted">por {importacion.usuario}</small>
        </div>
      )
    },
    {
      key: 'estado',
      label: 'Estado',
      render: (importacion) => (
        <span className={`badge ${getEstadoBadgeClass(importacion.estado)}`}>
          {importacion.estado}
        </span>
      )
    },
    {
      key: 'registros',
      label: 'Registros',
      render: (importacion) => (
        <div className="text-center">
          <div className="fw-semibold">{importacion.totalRegistros}</div>
          <div className="row text-center">
            <div className="col">
              <small className="text-success d-block">{importacion.registrosExitosos}</small>
              <small className="text-muted">Exitosos</small>
            </div>
            <div className="col">
              <small className="text-danger d-block">{importacion.registrosErroneos}</small>
              <small className="text-muted">Errores</small>
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'tiempoProcesamientoMs',
      label: 'Duración',
      render: (importacion) => (
        <div className="text-center">
          <span className="fw-semibold">
            {formatDuration(importacion.tiempoProcesamientoMs)}
          </span>
        </div>
      )
    },
    {
      key: 'tasa',
      label: 'Tasa de Éxito',
      render: (importacion) => {
        const tasa = ((importacion.registrosExitosos / importacion.totalRegistros) * 100).toFixed(1);
        return (
          <div className="text-center">
            <div className="fw-semibold">{tasa}%</div>
            <div className="progress mt-1" style={{ height: '4px' }}>
              <div 
                className={`progress-bar ${
                  tasa >= 90 ? 'bg-success' : tasa >= 70 ? 'bg-warning' : 'bg-danger'
                }`}
                style={{ width: `${tasa}%` }}
              ></div>
            </div>
          </div>
        );
      }
    },
    {
      key: 'acciones',
      label: 'Acciones',
      render: (importacion) => (
        <div className="dropdown">
          <button
            className="btn btn-sm btn-outline-secondary dropdown-toggle"
            type="button"
            data-bs-toggle="dropdown"
          >
            Acciones
          </button>
          <ul className="dropdown-menu">
            <li>
              <button className="dropdown-item">
                <i className="fas fa-eye me-2"></i>
                Ver Detalles
              </button>
            </li>
            {importacion.registrosErroneos > 0 && (
              <li>
                <button
                  className="dropdown-item text-danger"
                  onClick={() => handleVerErrores(importacion)}
                >
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  Ver Errores ({importacion.registrosErroneos})
                </button>
              </li>
            )}
            <li><hr className="dropdown-divider" /></li>
            <li>
              <button className="dropdown-item">
                <i className="fas fa-download me-2"></i>
                Descargar Reporte
              </button>
            </li>
            {importacion.estado === 'Fallida' && (
              <li>
                <button className="dropdown-item text-warning">
                  <i className="fas fa-redo me-2"></i>
                  Reintentar Importación
                </button>
              </li>
            )}
          </ul>
        </div>
      )
    }
  ];

  return (
    <div className="row">
      <div className={`col-${showFilters ? '9' : '12'}`}>
        <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h5 className="mb-0">
              <i className="fas fa-history text-primary me-2"></i>
              Historial de Importaciones
            </h5>
            <div className="d-flex gap-2">
              <button
                className={`btn btn-sm btn-outline-secondary ${showFilters ? 'active' : ''}`}
                onClick={() => setShowFilters(!showFilters)}
              >
                <i className="fas fa-filter me-1"></i>
                Filtros
              </button>
            </div>
          </div>

          <div className="card-body">
            {/* Barra de búsqueda */}
            <div className="row mb-3">
              <div className="col-md-8">
                <SearchBar
                  placeholder="Buscar por usuario..."
                  onSearch={handleSearch}
                  value={filtros.usuario}
                />
              </div>
              <div className="col-md-4 text-end">
                <span className="text-muted">
                  {historialImportaciones?.length || 0} importaciones encontradas
                </span>
              </div>
            </div>

            {/* Resumen rápido */}
            <div className="row mb-3">
              <div className="col-md-3">
                <div className="d-flex align-items-center">
                  <i className="fas fa-check-circle text-success me-2"></i>
                  <div>
                    <small className="text-muted d-block">Exitosas</small>
                    <strong className="text-success">
                      {historialImportaciones?.filter(h => h.estado === 'Completada').length || 0}
                    </strong>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="d-flex align-items-center">
                  <i className="fas fa-exclamation-triangle text-warning me-2"></i>
                  <div>
                    <small className="text-muted d-block">Con Errores</small>
                    <strong className="text-warning">
                      {historialImportaciones?.filter(h => h.estado === 'Completada con errores').length || 0}
                    </strong>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="d-flex align-items-center">
                  <i className="fas fa-times-circle text-danger me-2"></i>
                  <div>
                    <small className="text-muted d-block">Fallidas</small>
                    <strong className="text-danger">
                      {historialImportaciones?.filter(h => h.estado === 'Fallida').length || 0}
                    </strong>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="d-flex align-items-center">
                  <i className="fas fa-database text-info me-2"></i>
                  <div>
                    <small className="text-muted d-block">Total Registros</small>
                    <strong className="text-info">
                      {historialImportaciones?.reduce((sum, h) => sum + h.totalRegistros, 0) || 0}
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabla */}
            <Table
              columns={columns}
              data={historialImportaciones}
              loading={loading}
              emptyMessage="No se encontraron importaciones"
            />
          </div>
        </div>
      </div>

      {/* Sidebar de filtros */}
      {showFilters && (
        <div className="col-3">
          <FiltersSidebar
            filters={filterOptions}
            onFilterChange={handleFilterChange}
            onClearFilters={limpiarFiltros}
            title="Filtrar Historial"
          />
        </div>
      )}

      {/* Modal de detalle de errores */}
      <Modal
        isOpen={showModalErrores}
        onClose={() => setShowModalErrores(false)}
        title="Detalle de Errores de Importación"
        size="xl"
      >
        {selectedImportacion && (
          <div>
            <div className="alert alert-danger" role="alert">
              <h6 className="alert-heading">
                <i className="fas fa-exclamation-triangle me-2"></i>
                Importación: {selectedImportacion.nombreArchivo}
              </h6>
              <p className="mb-2">
                <strong>Fecha:</strong> {formatDate(selectedImportacion.fechaImportacion)} | 
                <strong> Usuario:</strong> {selectedImportacion.usuario}
              </p>
              <p className="mb-0">
                <strong>Total de errores:</strong> {selectedImportacion.registrosErroneos} de {selectedImportacion.totalRegistros} registros
              </p>
            </div>

            {detalleErrores?.length > 0 ? (
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead className="table-dark">
                    <tr>
                      <th>Fila</th>
                      <th>Columna</th>
                      <th>Valor Original</th>
                      <th>Error</th>
                      <th>Sugerencia</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detalleErrores.map((error, index) => (
                      <tr key={index}>
                        <td className="fw-semibold">{error.fila}</td>
                        <td><code>{error.columna}</code></td>
                        <td><code className="text-danger">{error.valorOriginal}</code></td>
                        <td>
                          <span className="badge bg-danger">{error.error}</span>
                          <br />
                          <small className="text-muted">{error.mensaje}</small>
                        </td>
                        <td className="text-success">{error.sugerencia}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Cargando errores...</span>
                </div>
                <p className="mt-2 text-muted">Cargando detalle de errores...</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default HistorialImportaciones;