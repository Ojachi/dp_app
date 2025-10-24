/**
 * Filtros para la búsqueda de pagos
 */
import React, { useState, useEffect } from 'react';
import { pagosService } from '../../../services/pagosService';
import { SearchBar } from '../../../components/SearchBar';
import { Button } from '../../../components/Button';

const ALLOWED_FILTER_KEYS = ['search', 'tipo_pago', 'fecha_desde', 'fecha_hasta', 'factura_id'];

const sanitizeFilters = (filters = {}) => {
  return Object.fromEntries(
    Object.entries(filters).filter(([key, value]) =>
      ALLOWED_FILTER_KEYS.includes(key) && value !== null && value !== undefined && value !== ''
    )
  );
};

const PagosFilters = ({ filters, onFiltersChange, onReset }) => {
  const [localFilters, setLocalFilters] = useState(() => sanitizeFilters(filters));
  const [metodosPago, setMetodosPago] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadMetodosPago();
  }, []);

  useEffect(() => {
    setLocalFilters(sanitizeFilters(filters));
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
    const cleanFilters = sanitizeFilters(localFilters);
    onFiltersChange(cleanFilters);
  };

  const handleReset = () => {
    setLocalFilters({});
    onReset();
  };

  const getActiveFiltersCount = () => {
    return Object.keys(sanitizeFilters(localFilters)).length;
  };

  return (
    <div className="dp-filter dp-card">
      <div className="dp-card-body">
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
              value={localFilters.tipo_pago || ''}
              onChange={(e) => handleFilterChange('tipo_pago', e.target.value)}
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
              <div className="col-md-4">
                <label className="form-label small">Fecha desde</label>
                <input
                  type="date"
                  className="form-control form-control-sm"
                  value={localFilters.fecha_desde || ''}
                  onChange={(e) => handleFilterChange('fecha_desde', e.target.value)}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label small">Fecha hasta</label>
                <input
                  type="date"
                  className="form-control form-control-sm"
                  value={localFilters.fecha_hasta || ''}
                  onChange={(e) => handleFilterChange('fecha_hasta', e.target.value)}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label small">ID de factura</label>
                <input
                  type="number"
                  className="form-control form-control-sm"
                  placeholder="Ej. 1024"
                  value={localFilters.factura_id || ''}
                  onChange={(e) => handleFilterChange('factura_id', e.target.value)}
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
        <div className="px-3 pb-3">
          <div className="d-flex flex-wrap gap-1">
            <small className="text-muted me-2">Filtros activos:</small>
            {Object.entries(sanitizeFilters(localFilters)).map(([key, value]) => {
              if (!value) return null;
              
              let label = key;
              let displayValue = value;
              
              // Personalizar labels
              const labels = {
                search: 'Búsqueda',
                fecha_desde: 'Desde',
                fecha_hasta: 'Hasta',
                tipo_pago: 'Tipo de pago',
                factura_id: 'Factura'
              };
              
              if (labels[key]) label = labels[key];
              
              // Formatear valor para métodos de pago
              if (key === 'tipo_pago') {
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
                      onFiltersChange(sanitizeFilters(newFilters));
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