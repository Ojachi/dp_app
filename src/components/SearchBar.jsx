/**
 * Componente de barra de búsqueda compatible con Bootstrap 5
 */
import React, { useState, useEffect } from 'react';

const SearchBar = ({
  value = '',
  onChange,
  placeholder = 'Buscar...',
  disabled = false,
  size = 'md',
  icon = true,
  clearButton = true,
  debounceMs = 300,
  className = '',
  id,
  name,
  ...props
}) => {
  
  const [localValue, setLocalValue] = useState(value);
  
  const searchId = id || `search-${Math.random().toString(36).substr(2, 9)}`;
  
  const sizeClasses = {
    sm: 'form-control-sm',
    md: '',
    lg: 'form-control-lg'
  };

  // Debounce effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onChange && localValue !== value) {
        onChange(localValue);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [localValue, debounceMs, onChange, value]);

  // Sync with external value changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (e) => {
    setLocalValue(e.target.value);
  };

  const handleClear = () => {
    setLocalValue('');
    if (onChange) {
      onChange('');
    }
  };

  const inputClasses = [
    'form-control',
    sizeClasses[size],
    icon ? 'ps-5' : '',
    clearButton && localValue ? 'pe-5' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className="position-relative">
      {icon && (
        <i 
          className="fas fa-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"
          style={{ zIndex: 5 }}
        ></i>
      )}
      
      <input
        id={searchId}
        name={name || searchId}
        type="search"
        className={inputClasses}
        value={localValue}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        {...props}
      />
      
      {clearButton && localValue && (
        <button
          type="button"
          className="btn btn-link position-absolute top-50 end-0 translate-middle-y me-2 p-1"
          style={{ zIndex: 5 }}
          onClick={handleClear}
          disabled={disabled}
          aria-label="Limpiar búsqueda"
        >
          <i className="fas fa-times text-muted"></i>
        </button>
      )}
    </div>
  );
};

export { SearchBar };
export default SearchBar;
