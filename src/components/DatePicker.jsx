/**
 * Componente de selector de fecha compatible con Bootstrap 5
 */
import React from 'react';

const DatePicker = ({
  label,
  value,
  onChange,
  required = false,
  disabled = false,
  error,
  helpText,
  size = 'md',
  min,
  max,
  className = '',
  id,
  name,
  ...props
}) => {
  
  const dateId = id || `date-${Math.random().toString(36).substr(2, 9)}`;
  
  const sizeClasses = {
    sm: 'form-control-sm',
    md: '',
    lg: 'form-control-lg'
  };

  const inputClasses = [
    'form-control',
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
        <label htmlFor={dateId} className="form-label">
          {label}
          {required && <span className="text-danger ms-1">*</span>}
        </label>
      )}
      
      <input
        id={dateId}
        name={name || dateId}
        type="date"
        className={inputClasses}
        value={value || ''}
        onChange={handleChange}
        required={required}
        disabled={disabled}
        min={min}
        max={max}
        {...props}
      />
      
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

export { DatePicker };
export default DatePicker;
