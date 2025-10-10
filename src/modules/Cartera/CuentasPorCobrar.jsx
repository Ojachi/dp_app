import React, { useState } from 'react';
import SearchBar from '../../components/SearchBar';
import FiltersSidebar from '../../components/FiltersSidebar';
import Table from '../../components/Table';
import Pagination from '../../components/Pagination';

const CuentasPorCobrar = ({ 
  cuentasPorCobrar,
  filtros,
  pagination,
  loading,
  actualizarFiltros,
  limpiarFiltros,
  cambiarPagina,
  onVerDetalle,
  enviarEstadoCuenta
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCuentas, setSelectedCuentas] = useState([]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value || 0);
  };

  const handleSearch = (searchTerm) => {
    actualizarFiltros({ cliente: searchTerm });
  };

  const handleFilterChange = (filterName, value) => {
    actualizarFiltros({ [filterName]: value });
  };

  const handleSelectCuenta = (cuentaId) => {
    setSelectedCuentas(prev => 
      prev.includes(cuentaId)
        ? prev.filter(id => id !== cuentaId)
        : [...prev, cuentaId]
    );
  };

  const handleSelectAll = (checked) => {
    setSelectedCuentas(checked ? cuentasPorCobrar.map(c => c.id) : []);
  };

  const handleEnviarEstados = async () => {
    try {
      for (const cuentaId of selectedCuentas) {
        await enviarEstadoCuenta(cuentaId);
      }
      alert('Estados de cuenta enviados exitosamente');
      setSelectedCuentas([]);
    } catch (error) {
      alert('Error al enviar estados de cuenta: ' + error.message);
    }
  };

  const filterOptions = [
    {
      name: 'estado',
      label: 'Estado',
      type: 'select',
      options: [
        { value: '', label: 'Todos los estados' },
        { value: 'Al día', label: 'Al día' },
        { value: 'En mora', label: 'En mora' }
      ],
      value: filtros.estado
    },
    {
      name: 'montoMin',
      label: 'Monto mínimo',
      type: 'number',
      placeholder: 'Monto mínimo',
      value: filtros.montoMin
    },
    {
      name: 'montoMax',
      label: 'Monto máximo',
      type: 'number',
      placeholder: 'Monto máximo',
      value: filtros.montoMax
    }
  ];

  const columns = [
    {
      key: 'select',
      label: (
        <input
          type="checkbox"
          className="form-check-input"
          checked={selectedCuentas.length === cuentasPorCobrar.length && cuentasPorCobrar.length > 0}
          onChange={(e) => handleSelectAll(e.target.checked)}
        />
      ),
      render: (cuenta) => (
        <input
          type="checkbox"
          className="form-check-input"
          checked={selectedCuentas.includes(cuenta.id)}
          onChange={() => handleSelectCuenta(cuenta.id)}
        />
      )
    },
    {
      key: 'cliente',
      label: 'Cliente',
      render: (cuenta) => (
        <div>
          <div className="fw-semibold">{cuenta.cliente}</div>
          <small className="text-muted">{cuenta.ruc}</small>
        </div>
      )
    },
    {
      key: 'contacto',
      label: 'Contacto',
      render: (cuenta) => (
        <div>
          <div>{cuenta.telefono}</div>
          <small className="text-muted">{cuenta.email}</small>
        </div>
      )
    },
    {
      key: 'totalDeuda',
      label: 'Deuda Total',
      render: (cuenta) => (
        <span className="fw-semibold">
          {formatCurrency(cuenta.totalDeuda)}
        </span>
      )
    },
    {
      key: 'facturasPendientes',
      label: 'Facturas',
      render: (cuenta) => (
        <span className="badge bg-light text-dark">
          {cuenta.facturasPendientes}
        </span>
      )
    },
    {
      key: 'estado',
      label: 'Estado',
      render: (cuenta) => (
        <span className={`badge ${
          cuenta.estado === 'En mora' ? 'bg-danger' : 'bg-success'
        }`}>
          {cuenta.estado}
        </span>
      )
    },
    {
      key: 'facturaVencida',
      label: 'Días Vencido',
      render: (cuenta) => (
        cuenta.facturaVencida ? (
          <div>
            <span className="text-danger fw-semibold">
              {cuenta.facturaVencida.diasVencido} días
            </span>
            <br />
            <small className="text-muted">
              {cuenta.facturaVencida.numero}
            </small>
          </div>
        ) : (
          <span className="text-success">--</span>
        )
      )
    },
    {
      key: 'historialPagos',
      label: 'Historial',
      render: (cuenta) => {
        const colorClass = 
          cuenta.historialPagos === 'Excelente' ? 'text-success' :
          cuenta.historialPagos === 'Bueno' || cuenta.historialPagos === 'Buen pagador' ? 'text-primary' :
          'text-warning';
        
        return (
          <span className={`fw-semibold ${colorClass}`}>
            {cuenta.historialPagos}
          </span>
        );
      }
    },
    {
      key: 'acciones',
      label: 'Acciones',
      render: (cuenta) => (
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
              <button
                className="dropdown-item"
                onClick={() => onVerDetalle(cuenta.id)}
              >
                <i className="fas fa-eye me-2"></i>
                Ver Detalle
              </button>
            </li>
            <li>
              <button
                className="dropdown-item"
                onClick={() => enviarEstadoCuenta(cuenta.id)}
              >
                <i className="fas fa-envelope me-2"></i>
                Enviar Estado
              </button>
            </li>
            <li><hr className="dropdown-divider" /></li>
            <li>
              <button className="dropdown-item text-primary">
                <i className="fas fa-phone me-2"></i>
                Llamar Cliente
              </button>
            </li>
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
              <i className="fas fa-list text-primary me-2"></i>
              Cuentas por Cobrar
            </h5>
            <div className="d-flex gap-2">
              {selectedCuentas.length > 0 && (
                <button
                  className="btn btn-sm btn-primary"
                  onClick={handleEnviarEstados}
                >
                  <i className="fas fa-envelope me-1"></i>
                  Enviar Estados ({selectedCuentas.length})
                </button>
              )}
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
                  placeholder="Buscar por nombre de cliente..."
                  onSearch={handleSearch}
                  value={filtros.cliente}
                />
              </div>
              <div className="col-md-4 text-end">
                <span className="text-muted">
                  {cuentasPorCobrar?.length || 0} cuentas encontradas
                </span>
              </div>
            </div>

            {/* Resumen rápido */}
            <div className="row mb-3">
              <div className="col-md-3">
                <div className="d-flex align-items-center">
                  <i className="fas fa-wallet text-primary me-2"></i>
                  <div>
                    <small className="text-muted d-block">Total Deuda</small>
                    <strong>
                      {formatCurrency(
                        cuentasPorCobrar?.reduce((sum, c) => sum + c.totalDeuda, 0) || 0
                      )}
                    </strong>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="d-flex align-items-center">
                  <i className="fas fa-exclamation-triangle text-danger me-2"></i>
                  <div>
                    <small className="text-muted d-block">En Mora</small>
                    <strong className="text-danger">
                      {cuentasPorCobrar?.filter(c => c.estado === 'En mora').length || 0}
                    </strong>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="d-flex align-items-center">
                  <i className="fas fa-check-circle text-success me-2"></i>
                  <div>
                    <small className="text-muted d-block">Al Día</small>
                    <strong className="text-success">
                      {cuentasPorCobrar?.filter(c => c.estado === 'Al día').length || 0}
                    </strong>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="d-flex align-items-center">
                  <i className="fas fa-file-invoice text-info me-2"></i>
                  <div>
                    <small className="text-muted d-block">Total Facturas</small>
                    <strong className="text-info">
                      {cuentasPorCobrar?.reduce((sum, c) => sum + c.facturasPendientes, 0) || 0}
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabla */}
            <Table
              columns={columns}
              data={cuentasPorCobrar}
              loading={loading}
              emptyMessage="No se encontraron cuentas por cobrar"
            />

            {/* Paginación */}
            {pagination.totalPages > 1 && (
              <div className="mt-3">
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages}
                  onPageChange={cambiarPagina}
                />
              </div>
            )}
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
            title="Filtrar Cuentas"
          />
        </div>
      )}
    </div>
  );
};

export default CuentasPorCobrar;