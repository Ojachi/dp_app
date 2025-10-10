/**
 * UsuariosFilters - Filtros para usuarios
 */
import React from 'react';
import Select from '../../components/Select';
import Input from '../../components/Input';
import Button from '../../components/Button';

const UsuariosFilters = ({ filtros, onFiltrosChange, onLimpiar }) => {
  
  // Opciones para los selectores
  const opcionesEstado = [
    { value: '', label: 'Todos los estados' },
    { value: 'true', label: 'Activos' },
    { value: 'false', label: 'Inactivos' }
  ];

  const opcionesRol = [
    { value: '', label: 'Todos los roles' },
    { value: 'gerente', label: 'Gerentes' },
    { value: 'vendedor', label: 'Vendedores' },
    { value: 'distribuidor', label: 'Distribuidores' }
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
              placeholder="Nombre, usuario o email..."
              value={filtros.buscar}
              onChange={(e) => handleChange('buscar', e.target.value)}
              icon="bi-search"
            />
          </div>

          {/* Estado */}
          <div className="col-md-2">
            <Select
              label="Estado"
              value={filtros.is_active}
              onChange={(e) => handleChange('is_active', e.target.value)}
              options={opcionesEstado}
            />
          </div>

          {/* Rol */}
          <div className="col-md-2">
            <Select
              label="Rol"
              value={filtros.rol}
              onChange={(e) => handleChange('rol', e.target.value)}
              options={opcionesRol}
            />
          </div>

          {/* Ciudad */}
          <div className="col-md-2">
            <Input
              label="Ciudad"
              placeholder="Ciudad..."
              value={filtros.ciudad}
              onChange={(e) => handleChange('ciudad', e.target.value)}
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
                
                {filtros.is_active && (
                  <span className="badge bg-light text-dark">
                    Estado: {filtros.is_active === 'true' ? 'Activos' : 'Inactivos'}
                    <button 
                      type="button" 
                      className="btn-close btn-close-sm ms-1"
                      onClick={() => handleChange('is_active', '')}
                      aria-label="Quitar filtro"
                    ></button>
                  </span>
                )}
                
                {filtros.rol && (
                  <span className="badge bg-light text-dark">
                    Rol: {filtros.rol.charAt(0).toUpperCase() + filtros.rol.slice(1)}
                    <button 
                      type="button" 
                      className="btn-close btn-close-sm ms-1"
                      onClick={() => handleChange('rol', '')}
                      aria-label="Quitar filtro"
                    ></button>
                  </span>
                )}
                
                {filtros.ciudad && (
                  <span className="badge bg-light text-dark">
                    Ciudad: {filtros.ciudad}
                    <button 
                      type="button" 
                      className="btn-close btn-close-sm ms-1"
                      onClick={() => handleChange('ciudad', '')}
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

export default UsuariosFilters;