import React from 'react';
import '../styles/FiltersSidebar.css'; // Asegúrate de tener el css abajo
import Button from './Button'; 
import Select from './Select';
import Input from './Input'; 

const FiltersSidebar = ({
  visible,
  onClose,
  filters,
  setFilters,
  filterConfig = [],
  onApply
}) => {
  // Cierra al aplicar (prop extra)
  const handleApply = () => {
    onApply && onApply();
    onClose();
  };

  return (
    <>
      {visible && <div className="filters-overlay" onClick={onClose} />}
      <aside className={`filters-sidebar${visible ? ' open' : ''}`}>
        <div className="filters-header d-flex justify-content-between align-items-center p-3">
          <strong>Filtros</strong>
          <Button color="danger" size="sm" onClick={onClose}>Cerrar</Button>
        </div>
        <div className="filters-body p-3">
          {filterConfig.map((filter) => (
            <div key={filter.id} className="mb-3">
              {filter.type === 'select' &&
                <Select
                  id={filter.id}
                  label={filter.label}
                  options={filter.options}
                  placeholder={filter.placeholder ?? null}
                  value={filters[filter.id] || ''}
                  onChange={(value) => setFilters(prev => ({ ...prev, [filter.id]: value }))}
                />}
              {filter.type === 'input' &&
                <Input
                  id={filter.id}
                  label={filter.label}
                  type={filter.inputType}
                  value={filters[filter.id] || ''}
                  onChange={(value) => setFilters(prev => ({ ...prev, [filter.id]: value }))}
                  placeholder={filter.placeholder}
                />}
            </div>
          ))}
        </div>
        <div className="p-3">
          <Button color="primary" className="w-100" onClick={handleApply}>
            Aplicar
          </Button>
        </div>
      </aside>
    </>
  );
};

export default FiltersSidebar;
