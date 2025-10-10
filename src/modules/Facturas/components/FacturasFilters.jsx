/**
 * Componente de filtros para facturas
 */
import React, { useState, useEffect } from 'react';
import { DatePicker } from '../../../components/DatePicker';
import { Select } from '../../../components/Select';
import { SearchBar } from '../../../components/SearchBar';

const FacturasFilters = ({
  filters,
  onFiltersChange,
  entidades,
  onClearFilters,
  loading = false
}) => {
  const [localFilters, setLocalFilters] = useState({
    numero_factura: '',
    cliente: '',
    vendedor: '',
    distribuidor: '',
    estado: '',
    fecha_desde: '',
    fecha_hasta: '',
    fecha_venc_desde: '',
    fecha_venc_hasta: '',
    valor_min: '',
    valor_max: '',
    saldo_pendiente: ''
  });

  const [collapsed, setCollapsed] = useState(true);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleFilterChange = (name, value) => {
    const updatedFilters = {
      ...localFilters,
      [name]: value
    };
    setLocalFilters(updatedFilters);
    onFiltersChange(updatedFilters);
  };

  const handleClearAll = () => {
    const emptyFilters = {
      numero_factura: '',
      cliente: '',
      vendedor: '',
      distribuidor: '',
      estado: '',
      fecha_desde: '',
      fecha_hasta: '',
      fecha_venc_desde: '',
      fecha_venc_hasta: '',
      valor_min: '',
      valor_max: '',
      saldo_pendiente: ''
    };
    setLocalFilters(emptyFilters);
    onClearFilters();
  };

  const estadosOptions = [
    { value: '', label: 'Todos los estados' },
    { value: 'pendiente', label: 'Pendiente' },
    { value: 'pagada', label: 'Pagada' },
    { value: 'vencida', label: 'Vencida' },
    { value: 'anulada', label: 'Anulada' }
  ];

  const saldoPendienteOptions = [
    { value: '', label: 'Todos' },
    { value: 'con_saldo', label: 'Con saldo pendiente' },
    { value: 'sin_saldo', label: 'Sin saldo pendiente' }
  ];

  const vendedoresOptions = [
    { value: '', label: 'Todos los vendedores' },
    ...(entidades?.vendedores || []).map(vendedor => ({
      value: vendedor.id,
      label: vendedor.nombre
    }))
  ];

  const distribuidoresOptions = [
    { value: '', label: 'Todos los distribuidores' },
    ...(entidades?.distribuidores || []).map(distribuidor => ({
      value: distribuidor.id,
      label: distribuidor.nombre
    }))
  ];

  // Contar filtros activos
  const activeFiltersCount = Object.values(localFilters).filter(value => 
    value !== '' && value !== null && value !== undefined
  ).length;

  return (
    <div className="card mb-3">
      <div className="card-header">
        <div className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <h6 className="mb-0 me-3">
              <i className="fas fa-filter me-2"></i>
              Filtros
            </h6>
            {activeFiltersCount > 0 && (
              <span className="badge bg-primary">
                {activeFiltersCount} activos
              </span>
            )}
          </div>
          
          <div className="btn-group btn-group-sm">
            <button
              className="btn btn-outline-secondary"
              onClick={() => setCollapsed(!collapsed)}
              disabled={loading}
            >
              <i className={`fas fa-chevron-${collapsed ? 'down' : 'up'}`}></i>
              {collapsed ? 'Mostrar' : 'Ocultar'}
            </button>
            
            {activeFiltersCount > 0 && (
              <button
                className="btn btn-outline-danger"
                onClick={handleClearAll}
                disabled={loading}
              >
                <i className="fas fa-times me-1"></i>
                Limpiar
              </button>
            )}
          </div>
        </div>
      </div>

      {!collapsed && (
        <div className="card-body">
          <div className="row g-3">
            {/* Búsqueda general */}
            <div className="col-md-6">
              <SearchBar
                value={localFilters.numero_factura}
                onChange={(value) => handleFilterChange('numero_factura', value)}
                placeholder="Buscar por número de factura..."
                disabled={loading}
              />
            </div>
            
            <div className="col-md-6">
              <SearchBar
                value={localFilters.cliente}
                onChange={(value) => handleFilterChange('cliente', value)}
                placeholder="Buscar por cliente..."
                disabled={loading}
              />
            </div>

            {/* Selects de entidades */}
            <div className="col-md-4">
              <Select
                label="Vendedor"
                value={localFilters.vendedor}
                onChange={(value) => handleFilterChange('vendedor', value)}
                options={vendedoresOptions}
                disabled={loading}
              />
            </div>

            <div className="col-md-4">
              <Select
                label="Distribuidor"
                value={localFilters.distribuidor}
                onChange={(value) => handleFilterChange('distribuidor', value)}
                options={distribuidoresOptions}
                disabled={loading}
              />
            </div>

            <div className="col-md-4">
              <Select
                label="Estado"
                value={localFilters.estado}
                onChange={(value) => handleFilterChange('estado', value)}
                options={estadosOptions}
                disabled={loading}
              />
            </div>

            {/* Fechas de emisión */}
            <div className="col-md-6">
              <DatePicker
                label="Fecha emisión desde"
                value={localFilters.fecha_desde}
                onChange={(value) => handleFilterChange('fecha_desde', value)}
                disabled={loading}
              />
            </div>

            <div className="col-md-6">
              <DatePicker
                label="Fecha emisión hasta"
                value={localFilters.fecha_hasta}
                onChange={(value) => handleFilterChange('fecha_hasta', value)}
                disabled={loading}
              />
            </div>

            {/* Fechas de vencimiento */}
            <div className="col-md-6">
              <DatePicker
                label="Vencimiento desde"
                value={localFilters.fecha_venc_desde}
                onChange={(value) => handleFilterChange('fecha_venc_desde', value)}
                disabled={loading}
              />
            </div>

            <div className="col-md-6">
              <DatePicker
                label="Vencimiento hasta"
                value={localFilters.fecha_venc_hasta}
                onChange={(value) => handleFilterChange('fecha_venc_hasta', value)}
                disabled={loading}
              />
            </div>

            {/* Valores monetarios */}
            <div className="col-md-4">
              <label className="form-label">Valor mínimo</label>
              <div className="input-group">
                <span className="input-group-text">$</span>
                <input
                  type="number"
                  className="form-control"
                  value={localFilters.valor_min}
                  onChange={(e) => handleFilterChange('valor_min', e.target.value)}
                  placeholder="0"
                  min="0"
                  step="0.01"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="col-md-4">
              <label className="form-label">Valor máximo</label>
              <div className="input-group">
                <span className="input-group-text">$</span>
                <input
                  type="number"
                  className="form-control"
                  value={localFilters.valor_max}
                  onChange={(e) => handleFilterChange('valor_max', e.target.value)}
                  placeholder="999999"
                  min="0"
                  step="0.01"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="col-md-4">
              <Select
                label="Saldo pendiente"
                value={localFilters.saldo_pendiente}
                onChange={(value) => handleFilterChange('saldo_pendiente', value)}
                options={saldoPendienteOptions}
                disabled={loading}
              />
            </div>
          </div>

          {/* Filtros rápidos */}
          <div className="mt-4 pt-3 border-top">
            <h6 className="mb-2">Filtros rápidos:</h6>
            <div className="d-flex flex-wrap gap-2">
              <button
                className="btn btn-outline-warning btn-sm"
                onClick={() => handleFilterChange('estado', 'vencida')}
                disabled={loading}
              >
                <i className="fas fa-exclamation-triangle me-1"></i>
                Vencidas
              </button>
              
              <button
                className="btn btn-outline-info btn-sm"
                onClick={() => handleFilterChange('saldo_pendiente', 'con_saldo')}
                disabled={loading}
              >
                <i className="fas fa-money-bill me-1"></i>
                Con saldo
              </button>
              
              <button
                className="btn btn-outline-success btn-sm"
                onClick={() => handleFilterChange('estado', 'pagada')}
                disabled={loading}
              >
                <i className="fas fa-check-circle me-1"></i>
                Pagadas
              </button>
              
              <button
                className="btn btn-outline-primary btn-sm"
                onClick={() => {
                  const hoy = new Date().toISOString().split('T')[0];
                  const proxSemana = new Date();
                  proxSemana.setDate(proxSemana.getDate() + 7);
                  handleFilterChange('fecha_venc_desde', hoy);
                  handleFilterChange('fecha_venc_hasta', proxSemana.toISOString().split('T')[0]);
                }}
                disabled={loading}
              >
                <i className="fas fa-calendar-week me-1"></i>
                Próxima semana
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacturasFilters;