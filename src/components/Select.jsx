/**
 * Componente de select compatible con Bootstrap 5
 */
import React from 'react';

const Select = ({
  label,
  value,
  onChange,
  options = [],
  required = false,
  disabled = false,
  error,
  helpText,
  size = 'md',
  placeholder = 'Seleccionar...',
  className = '',
  id,
  name,
  ...props
}) => {
  
  const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;
  
  const sizeClasses = {
    sm: 'form-select-sm',
    md: '',
    lg: 'form-select-lg'
  };

  const selectClasses = [
    'form-select',
    sizeClasses[size],
    error ? 'is-invalid' : '',
    className
  ].filter(Boolean).join(' ');

  const handleChange = (e) => {
    if (onChange) {
      onChange(e.target.value, e);
    }
  };

  return (
    <div className="mb-3">
      {label && (
        <label htmlFor={selectId} className="form-label">
          {label}
          {required && <span className="text-danger ms-1">*</span>}
        </label>
      )}
      
      <select
        id={selectId}
        name={name || selectId}
        className={selectClasses}
        value={value || ''}
        onChange={handleChange}
        required={required}
        disabled={disabled}
        {...props}
      >
        {placeholder && (
          <option value="" disabled={required}>
            {placeholder}
          </option>
        )}
        
        {options.map((option, index) => {
          const optionValue = option.value !== undefined ? option.value : option;
          const optionLabel = option.label !== undefined ? option.label : option;
          
          return (
            <option
              key={optionValue !== undefined ? optionValue : index}
              value={optionValue}
              disabled={option.disabled}
            >
              {optionLabel}
            </option>
          );
        })}
      </select>
      
      {error && (
        <div className="invalid-feedback d-block">
          {error}
        </div>
      )}
      
      {helpText && !error && (
        <div className="form-text">
          {helpText}
        </div>
      )}
    </div>
  );
};

export { Select };
export default Select;
