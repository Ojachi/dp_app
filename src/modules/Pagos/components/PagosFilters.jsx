/**
 * Filtros para la búsqueda de pagos
 */
import React, { useState, useEffect } from 'react';
import { pagosService } from '../../../services/pagosService';
import { SearchBar } from '../../../components/SearchBar';
import { Button } from '../../../components/Button';

const PagosFilters = ({ filters, onFiltersChange, onReset }) => {
  const [localFilters, setLocalFilters] = useState(filters || {});
  const [metodosPago, setMetodosPago] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadMetodosPago();
  }, []);

  useEffect(() => {
    setLocalFilters(filters || {});
  }, [filters]);

  const loadMetodosPago = async () => {
    try {
      const metodos = await pagosService.getMetodosPago();
      setMetodosPago(metodos);
    } catch (error) {
      console.error('Error al cargar métodos de pago:', error);
    }
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
  };

  const handleApplyFilters = () => {
    // Limpiar filtros vacíos
    const cleanFilters = Object.fromEntries(
      Object.entries(localFilters).filter(([_, value]) => 
        value !== null && value !== undefined && value !== ''
      )
    );
    onFiltersChange(cleanFilters);
  };

  const handleReset = () => {
    setLocalFilters({});
    onReset();
  };

  const getActiveFiltersCount = () => {
    return Object.values(localFilters).filter(value => 
      value !== null && value !== undefined && value !== ''
    ).length;
  };

  return (
    <div className="border-bottom bg-light">
      <div className="p-3">
        {/* Búsqueda principal */}
        <div className="row g-3 align-items-end">
          <div className="col-md-6">
            <SearchBar
              placeholder="Buscar por número de pago, factura, cliente..."
              value={localFilters.search || ''}
              onChange={(value) => handleFilterChange('search', value)}
              onSearch={handleApplyFilters}
            />
          </div>
          <div className="col-md-3">
            <select
              className="form-select"
              value={localFilters.metodo_pago || ''}
              onChange={(e) => handleFilterChange('metodo_pago', e.target.value)}
            >
              <option value="">Todos los métodos</option>
              {metodosPago.map(metodo => (
                <option key={metodo.id} value={metodo.id}>
                  {metodo.nombre}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-3">
            <div className="d-flex gap-2">
              <Button
                variant="primary"
                onClick={() => setShowFilters(!showFilters)}
                className="position-relative"
              >
                <i className="fas fa-filter me-1"></i>
                Filtros
                {getActiveFiltersCount() > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                    {getActiveFiltersCount()}
                  </span>
                )}
              </Button>
              <Button
                variant="outline-secondary"
                onClick={handleApplyFilters}
              >
                <i className="fas fa-search"></i>
              </Button>
            </div>
          </div>
        </div>

        {/* Filtros avanzados */}
        {showFilters && (
          <div className="mt-3 pt-3 border-top">
            <div className="row g-3">
              {/* Fechas */}
              <div className="col-md-3">
                <label className="form-label small">Fecha desde</label>
                <input
                  type="date"
                  className="form-control form-control-sm"
                  value={localFilters.fecha_desde || ''}
                  onChange={(e) => handleFilterChange('fecha_desde', e.target.value)}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label small">Fecha hasta</label>
                <input
                  type="date"
                  className="form-control form-control-sm"
                  value={localFilters.fecha_hasta || ''}
                  onChange={(e) => handleFilterChange('fecha_hasta', e.target.value)}
                />
              </div>

              {/* Montos */}
              <div className="col-md-3">
                <label className="form-label small">Monto mínimo</label>
                <input
                  type="number"
                  className="form-control form-control-sm"
                  placeholder="0"
                  value={localFilters.monto_min || ''}
                  onChange={(e) => handleFilterChange('monto_min', e.target.value)}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label small">Monto máximo</label>
                <input
                  type="number"
                  className="form-control form-control-sm"
                  placeholder="Sin límite"
                  value={localFilters.monto_max || ''}
                  onChange={(e) => handleFilterChange('monto_max', e.target.value)}
                />
              </div>

              {/* Estado */}
              <div className="col-md-3">
                <label className="form-label small">Estado</label>
                <select
                  className="form-select form-select-sm"
                  value={localFilters.estado || ''}
                  onChange={(e) => handleFilterChange('estado', e.target.value)}
                >
                  <option value="">Todos los estados</option>
                  <option value="completado">Completado</option>
                  <option value="pendiente">Pendiente</option>
                  <option value="procesando">Procesando</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </div>

              {/* Cliente */}
              <div className="col-md-3">
                <label className="form-label small">Cliente</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Nombre del cliente"
                  value={localFilters.cliente || ''}
                  onChange={(e) => handleFilterChange('cliente', e.target.value)}
                />
              </div>

              {/* Referencia */}
              <div className="col-md-3">
                <label className="form-label small">Referencia</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Número de referencia"
                  value={localFilters.referencia || ''}
                  onChange={(e) => handleFilterChange('referencia', e.target.value)}
                />
              </div>

              {/* Usuario */}
              <div className="col-md-3">
                <label className="form-label small">Registrado por</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Usuario"
                  value={localFilters.usuario || ''}
                  onChange={(e) => handleFilterChange('usuario', e.target.value)}
                />
              </div>
            </div>

            {/* Botones de acción */}
            <div className="d-flex justify-content-end gap-2 mt-3">
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={handleReset}
              >
                <i className="fas fa-undo me-1"></i>
                Limpiar
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleApplyFilters}
              >
                <i className="fas fa-search me-1"></i>
                Aplicar Filtros
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Filtros activos */}
      {getActiveFiltersCount() > 0 && (
        <div className="px-3 pb-2">
          <div className="d-flex flex-wrap gap-1">
            <small className="text-muted me-2">Filtros activos:</small>
            {Object.entries(localFilters).map(([key, value]) => {
              if (!value) return null;
              
              let label = key;
              let displayValue = value;
              
              // Personalizar labels
              const labels = {
                search: 'Búsqueda',
                fecha_desde: 'Desde',
                fecha_hasta: 'Hasta',
                monto_min: 'Min',
                monto_max: 'Max',
                metodo_pago: 'Método',
                estado: 'Estado',
                cliente: 'Cliente',
                referencia: 'Referencia',
                usuario: 'Usuario'
              };
              
              if (labels[key]) label = labels[key];
              
              // Formatear valor para métodos de pago
              if (key === 'metodo_pago') {
                const metodo = metodosPago.find(m => m.id === value);
                displayValue = metodo ? metodo.nombre : value;
              }
              
              return (
                <span key={key} className="badge bg-primary">
                  {label}: {displayValue}
                  <button
                    type="button"
                    className="btn-close btn-close-white ms-1"
                    style={{ fontSize: '0.7em' }}
                    onClick={() => {
                      const newFilters = { ...localFilters };
                      delete newFilters[key];
                      setLocalFilters(newFilters);
                      onFiltersChange(newFilters);
                    }}
                  ></button>
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default PagosFilters;