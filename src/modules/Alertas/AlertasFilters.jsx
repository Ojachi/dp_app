/**
 * AlertasFilters - Filtros para alertas
 */
import React from 'react';
import Select from '../../components/Select';
import Input from '../../components/Input';
import DatePicker from '../../components/DatePicker';
import Button from '../../components/Button';

const AlertasFilters = ({ filtros, onFiltrosChange, onLimpiar }) => {
  
  // Opciones para los selectores
  const opcionesLeida = [
    { value: '', label: 'Todas' },
    { value: 'false', label: 'No leídas' },
    { value: 'true', label: 'Leídas' }
  ];

  const opcionesPrioridad = [
    { value: '', label: 'Todas las prioridades' },
    { value: 'alta', label: 'Alta' },
    { value: 'media', label: 'Media' },
    { value: 'baja', label: 'Baja' }
  ];

  const opcionesTipo = [
    { value: '', label: 'Todos los tipos' },
    { value: 'sistema', label: 'Sistema' },
    { value: 'factura', label: 'Factura' },
    { value: 'pago', label: 'Pago' },
    { value: 'cartera', label: 'Cartera' },
    { value: 'importacion', label: 'Importación' }
  ];

  const handleChange = (campo, valor) => {
    onFiltrosChange({ [campo]: valor });
  };

  const hayFiltros = Object.values(filtros).some(valor => valor !== '');

  return (
    <div className="card mb-4">
      <div className="card-header">
        <h6 className="card-title mb-0">
          <i className="bi bi-funnel me-2"></i>
          Filtros de Búsqueda
        </h6>
      </div>
      <div className="card-body">
        <div className="row g-3">
          {/* Búsqueda por texto */}
          <div className="col-md-4">
            <Input
              label="Buscar"
              placeholder="Título o mensaje..."
              value={filtros.buscar}
              onChange={(e) => handleChange('buscar', e.target.value)}
              icon="bi-search"
            />
          </div>

          {/* Estado de lectura */}
          <div className="col-md-2">
            <Select
              label="Estado"
              value={filtros.leida}
              onChange={(e) => handleChange('leida', e.target.value)}
              options={opcionesLeida}
            />
          </div>

          {/* Prioridad */}
          <div className="col-md-2">
            <Select
              label="Prioridad"
              value={filtros.prioridad}
              onChange={(e) => handleChange('prioridad', e.target.value)}
              options={opcionesPrioridad}
            />
          </div>

          {/* Tipo */}
          <div className="col-md-2">
            <Select
              label="Tipo"
              value={filtros.tipo}
              onChange={(e) => handleChange('tipo', e.target.value)}
              options={opcionesTipo}
            />
          </div>

          {/* Botón de limpiar */}
          <div className="col-md-2 d-flex align-items-end">
            <Button
              variant="outline-secondary"
              onClick={onLimpiar}
              disabled={!hayFiltros}
              className="w-100"
            >
              <i className="bi bi-arrow-clockwise me-1"></i>
              Limpiar
            </Button>
          </div>

          {/* Fecha desde */}
          <div className="col-md-3">
            <DatePicker
              label="Desde"
              value={filtros.fecha_desde}
              onChange={(valor) => handleChange('fecha_desde', valor)}
              placeholder="Fecha inicial"
            />
          </div>

          {/* Fecha hasta */}
          <div className="col-md-3">
            <DatePicker
              label="Hasta"
              value={filtros.fecha_hasta}
              onChange={(valor) => handleChange('fecha_hasta', valor)}
              placeholder="Fecha final"
            />
          </div>

          {/* Información de filtros activos */}
          <div className="col-md-6 d-flex align-items-end">
            {hayFiltros && (
              <div className="text-muted small">
                <i className="bi bi-info-circle me-1"></i>
                Filtros activos: {Object.values(filtros).filter(v => v !== '').length}
              </div>
            )}
          </div>
        </div>

        {/* Resumen de filtros aplicados */}
        {hayFiltros && (
          <div className="row mt-3">
            <div className="col-12">
              <div className="d-flex flex-wrap gap-2">
                <small className="text-muted me-2">Filtros aplicados:</small>
                
                {filtros.buscar && (
                  <span className="badge bg-light text-dark">
                    Texto: "{filtros.buscar}"
                    <button 
                      type="button" 
                      className="btn-close btn-close-sm ms-1"
                      onClick={() => handleChange('buscar', '')}
                      aria-label="Quitar filtro"
                    ></button>
                  </span>
                )}
                
                {filtros.leida && (
                  <span className="badge bg-light text-dark">
                    Estado: {filtros.leida === 'true' ? 'Leídas' : 'No leídas'}
                    <button 
                      type="button" 
                      className="btn-close btn-close-sm ms-1"
                      onClick={() => handleChange('leida', '')}
                      aria-label="Quitar filtro"
                    ></button>
                  </span>
                )}
                
                {filtros.prioridad && (
                  <span className="badge bg-light text-dark">
                    Prioridad: {filtros.prioridad}
                    <button 
                      type="button" 
                      className="btn-close btn-close-sm ms-1"
                      onClick={() => handleChange('prioridad', '')}
                      aria-label="Quitar filtro"
                    ></button>
                  </span>
                )}
                
                {filtros.tipo && (
                  <span className="badge bg-light text-dark">
                    Tipo: {filtros.tipo}
                    <button 
                      type="button" 
                      className="btn-close btn-close-sm ms-1"
                      onClick={() => handleChange('tipo', '')}
                      aria-label="Quitar filtro"
                    ></button>
                  </span>
                )}
                
                {filtros.fecha_desde && (
                  <span className="badge bg-light text-dark">
                    Desde: {new Date(filtros.fecha_desde).toLocaleDateString()}
                    <button 
                      type="button" 
                      className="btn-close btn-close-sm ms-1"
                      onClick={() => handleChange('fecha_desde', '')}
                      aria-label="Quitar filtro"
                    ></button>
                  </span>
                )}
                
                {filtros.fecha_hasta && (
                  <span className="badge bg-light text-dark">
                    Hasta: {new Date(filtros.fecha_hasta).toLocaleDateString()}
                    <button 
                      type="button" 
                      className="btn-close btn-close-sm ms-1"
                      onClick={() => handleChange('fecha_hasta', '')}
                      aria-label="Quitar filtro"
                    ></button>
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertasFilters;