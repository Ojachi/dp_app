/**
 * Componente de input compatible con Bootstrap 5
 */
import React from 'react';

const Input = ({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  error,
  helpText,
  size = 'md',
  rows = 3,
  min,
  max,
  step,
  className = '',
  id,
  name,
  ...props
}) => {
  
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  
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

  const InputComponent = type === 'textarea' ? 'textarea' : 'input';

  return (
    <div className="mb-3">
      {label && (
        <label htmlFor={inputId} className="form-label">
          {label}
          {required && <span className="text-danger ms-1">*</span>}
        </label>
      )}
      
      <InputComponent
        id={inputId}
        name={name || inputId}
        type={type === 'textarea' ? undefined : type}
        className={inputClasses}
        value={value || ''}
        onChange={handleChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        rows={type === 'textarea' ? rows : undefined}
        min={min}
        max={max}
        step={step}
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

export { Input };
export default Input;
