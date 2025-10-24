import React, { useEffect, useMemo, useState } from 'react';
import { useToast } from '../../components/Toast';
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
  const { toast } = useToast();
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCuentas, setSelectedCuentas] = useState([]);
  const hasActiveFilters = useMemo(() => {
    const f = filtros || {};
    return Object.values(f).some(v => v !== '' && v !== null && v !== undefined);
  }, [filtros]);

  const filteredData = useMemo(() => {
    let data = Array.isArray(cuentasPorCobrar) ? cuentasPorCobrar : [];
    const f = filtros || {};
    const valOrZero = (n) => (n === null || n === undefined || n === '' ? 0 : Number(n));

    // Estado: 'Al día' o 'En mora'
    if (f.estado) {
      data = data.filter((c) => String(c.estado).toLowerCase().includes(String(f.estado).toLowerCase()));
    }
    // Monto
    if (f.montoMin !== undefined && f.montoMin !== '') {
      data = data.filter((c) => Number(c.totalDeuda || 0) >= Number(f.montoMin));
    }
    if (f.montoMax !== undefined && f.montoMax !== '') {
      data = data.filter((c) => Number(c.totalDeuda || 0) <= Number(f.montoMax));
    }
    // Días vencido
    if (f.diasVencidoMin !== undefined && f.diasVencidoMin !== '') {
      data = data.filter((c) => valOrZero(c?.facturaVencida?.diasVencido) >= Number(f.diasVencidoMin));
    }
    if (f.diasVencidoMax !== undefined && f.diasVencidoMax !== '') {
      data = data.filter((c) => valOrZero(c?.facturaVencida?.diasVencido) <= Number(f.diasVencidoMax));
    }
    // Historial de pagos
    if (f.historial) {
      data = data.filter((c) => String(c.historialPagos || '').toLowerCase() === String(f.historial).toLowerCase());
    }
    // Activas vencidas min/max
    if (f.activasVencidasMin !== undefined && f.activasVencidasMin !== '') {
      data = data.filter((c) => Number(c.activasVencidas || 0) >= Number(f.activasVencidasMin));
    }
    if (f.activasVencidasMax !== undefined && f.activasVencidasMax !== '') {
      data = data.filter((c) => Number(c.activasVencidas || 0) <= Number(f.activasVencidasMax));
    }
    return data;
  }, [cuentasPorCobrar, filtros]);

  const paginatedData = useMemo(() => {
    const data = filteredData;
    if (!Array.isArray(data) || data.length === 0) {
      return [];
    }
    const { page = 1, limit = data.length } = pagination || {};
    const startIndex = (page - 1) * limit;
    return data.slice(startIndex, startIndex + limit);
  }, [filteredData, pagination]);

  const allVisibleSelected =
    paginatedData.length > 0 && paginatedData.every((cuenta) => selectedCuentas.includes(cuenta.id));

  useEffect(() => {
    if (!Array.isArray(cuentasPorCobrar) || cuentasPorCobrar.length === 0) {
      if (selectedCuentas.length > 0) {
        setSelectedCuentas([]);
      }
      return;
    }

    setSelectedCuentas((prev) => {
      const filtered = prev.filter((id) => cuentasPorCobrar.some((cuenta) => cuenta.id === id));
      return filtered.length === prev.length ? prev : filtered;
    });
  }, [cuentasPorCobrar, selectedCuentas.length]);

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

  // Los cambios de filtros se aplican desde el FiltersSidebar via setFiltersWrapper

  const handleSelectCuenta = (cuentaId) => {
    setSelectedCuentas(prev => 
      prev.includes(cuentaId)
        ? prev.filter(id => id !== cuentaId)
        : [...prev, cuentaId]
    );
  };

  const handleSelectAll = (checked) => {
    setSelectedCuentas(checked ? paginatedData.map((cuenta) => cuenta.id) : []);
  };

  const handleEnviarEstados = async () => {
    try {
      for (const cuentaId of selectedCuentas) {
        await enviarEstadoCuenta(cuentaId);
      }
      toast.success('Estados de cuenta enviados exitosamente');
      setSelectedCuentas([]);
    } catch (error) {
      toast.error('Error al enviar estados de cuenta: ' + (error.message || 'Ocurrió un error'));
    }
  };

  // Configuración para FiltersSidebar (nuevo API)
  const filterConfig = [
    {
      id: 'estado',
      label: 'Estado',
      type: 'select',
      options: [
        { value: '', label: 'Todos los estados' },
        { value: 'aldia', label: 'Al día' },
        { value: 'vencida', label: 'En mora' }
      ]
    },
    {
      id: 'montoMin',
      label: 'Monto mínimo',
      type: 'input',
      inputType: 'number',
      placeholder: 'Monto mínimo'
    },
    {
      id: 'montoMax',
      label: 'Monto máximo',
      type: 'input',
      inputType: 'number',
      placeholder: 'Monto máximo'
    }
    ,
    {
      id: 'diasVencidoMin',
      label: 'Días vencido (mín)',
      type: 'input',
      inputType: 'number',
      placeholder: '0'
    },
    {
      id: 'diasVencidoMax',
      label: 'Días vencido (máx)',
      type: 'input',
      inputType: 'number',
      placeholder: '999'
    },
    {
      id: 'historial',
      label: 'Historial de pagos',
      type: 'select',
      options: [
        { value: '', label: 'Todos' },
        { value: 'Excelente', label: 'Excelente' },
        { value: 'Bueno', label: 'Bueno' },
        { value: 'Buen pagador', label: 'Buen pagador' },
        { value: 'Regular', label: 'Regular' }
      ]
    },
    {
      id: 'activasVencidasMin',
      label: 'Activas vencidas (mín)',
      type: 'input',
      inputType: 'number',
      placeholder: '0'
    },
    {
      id: 'activasVencidasMax',
      label: 'Activas vencidas (máx)',
      type: 'input',
      inputType: 'number',
      placeholder: '999'
    }
  ];

  // Adaptador para el nuevo Sidebar: acepta setFilters estilo React y delega a actualizarFiltros
  const setFiltersWrapper = (updater) => {
    const current = filtros || {};
    const next = typeof updater === 'function' ? updater(current) : updater;
    // aplicar todos los cambios de una vez
    actualizarFiltros(next);
  };

  const columns = [
    {
      key: 'select',
      label: (
        <input
          type="checkbox"
          className="form-check-input"
          checked={allVisibleSelected}
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
      key: 'facturasResumen',
      label: 'Facturas (Act/Total)',
      render: (cuenta) => (
        <span className="badge bg-light text-dark">
          {cuenta.facturasActivas ?? 0} / {cuenta.totalFacturas ?? 0}
        </span>
      )
    },
    {
      key: 'activosDetalle',
      label: 'Activas: Pend./Par./Venc.',
      render: (cuenta) => (
        <span className="text-nowrap">
          <span className="badge bg-secondary me-1" title="Pendientes">
            {cuenta.activasPendientes ?? 0}
          </span>
          <span className="badge bg-warning text-dark me-1" title="Parciales">
            {cuenta.activasParciales ?? 0}
          </span>
          <span className="badge bg-danger" title="Vencidas">
            {cuenta.activasVencidas ?? 0}
          </span>
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
    // {
    //   key: 'acciones',
    //   label: 'Acciones',
    //   render: (cuenta) => (
    //     <div className="dropdown">
    //       <button
    //         className="btn btn-sm btn-outline-secondary dropdown-toggle"
    //         type="button"
    //         data-bs-toggle="dropdown"
    //       >
    //         Acciones
    //       </button>
    //       <ul className="dropdown-menu">
    //         <li>
    //           <button
    //             className="dropdown-item"
    //             onClick={() => onVerDetalle(cuenta.id)}
    //           >
    //             <i className="fas fa-eye me-2"></i>
    //             Ver Detalle
    //           </button>
    //         </li>
    //         <li>
    //           <button
    //             className="dropdown-item"
    //             onClick={() => enviarEstadoCuenta(cuenta.id)}
    //           >
    //             <i className="fas fa-envelope me-2"></i>
    //             Enviar Estado
    //           </button>
    //         </li>
    //         <li><hr className="dropdown-divider" /></li>
    //         <li>
    //           <button className="dropdown-item text-primary">
    //             <i className="fas fa-phone me-2"></i>
    //             Llamar Cliente
    //           </button>
    //         </li>
    //       </ul>
    //     </div>
    //   )
    // }
  ];

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">
          <i className="fas fa-list me-2 text-primary"></i>
          Cuentas por Cobrar
        </h2> 
        <div className="d-flex gap-2">
          {selectedCuentas.length > 0 && (
            <button className="btn btn-primary" onClick={handleEnviarEstados}>
              <i className="fas fa-envelope me-1"></i>
              Enviar Estados ({selectedCuentas.length})
            </button>
          )}
        </div>
      </div>

      {/* Toolbar: búsqueda fija + botón Filtros + limpiar */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="d-flex align-items-center gap-2 flex-grow-1">
          <div className="flex-grow-1" style={{ maxWidth: '620px' }}>
            <SearchBar
              placeholder="Buscar por nombre de cliente..."
              value={filtros.cliente}
              onChange={(value) => handleSearch(value)}
              onSearch={(value) => handleSearch(value)}
            />
          </div>
          <button
            className={`btn btn-outline-secondary ${showFilters ? 'active' : ''}`}
            onClick={() => setShowFilters((v) => !v)}
          >
            <i className="fas fa-filter me-1"></i>
            Filtros
          </button>
          {hasActiveFilters && (
            <button
              className="btn btn-outline-secondary"
              onClick={() => { limpiarFiltros(); setShowFilters(false); }}
            >
              <i className="fas fa-broom me-1"></i>
              Limpiar filtros
            </button>
          )}
        </div>
        <div className="d-flex gap-2"></div>
      </div>

      {/* Card con métricas + tabla */}
      <div className="card">
        <div className="card-body">
          {/* Resumen rápido */}
          <div className="row mb-3">
            <div className="col-md-3">
              <div className="d-flex align-items-center">
                <i className="fas fa-wallet text-primary me-2"></i>
                <div>
                  <small className="text-muted d-block">Total Deuda</small>
                  <strong>
                    {formatCurrency(filteredData?.reduce((sum, c) => sum + (c.totalDeuda || 0), 0) || 0)}
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
                    {filteredData?.filter(c => c.estado === 'En mora').length || 0}
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
                    {filteredData?.filter(c => c.estado === 'Al día').length || 0}
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
                    {filteredData?.reduce((sum, c) => sum + (c.facturasPendientes || 0), 0) || 0}
                  </strong>
                </div>
              </div>
            </div>
          </div>

          {/* Tabla */}
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="text-muted">{filteredData?.length || 0} cuentas encontradas</span>
          </div>
          <Table
            columns={columns}
            data={paginatedData}
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

      {/* Sidebar de filtros (overlay) */}
      {showFilters && (
        <FiltersSidebar
          visible={true}
          onClose={() => setShowFilters(false)}
          filters={filtros}
          setFilters={setFiltersWrapper}
          filterConfig={filterConfig}
          onApply={() => setShowFilters(false)}
        />
      )}
    </div>
  );
};

export default CuentasPorCobrar;