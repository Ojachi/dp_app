/**
 * Componente de checkbox compatible con Bootstrap 5
 */
import React from 'react';

const Checkbox = ({
  id,
  name,
  label,
  checked = false,
  onChange,
  disabled = false,
  error,
  helpText,
  className = '',
  ...props
}) => {
  
  const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;
  
  const handleChange = (e) => {
    if (onChange) {
      onChange(e);
    }
  };

  return (
    <div className={`mb-3 ${className}`}>
      <div className="form-check">
        <input
          className={`form-check-input ${error ? 'is-invalid' : ''}`}
          type="checkbox"
          id={checkboxId}
          name={name || checkboxId}
          checked={checked}
          onChange={handleChange}
          disabled={disabled}
          {...props}
        />
        {label && (
          <label className="form-check-label" htmlFor={checkboxId}>
            {label}
          </label>
        )}
      </div>
      
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

export { Checkbox };
export default Checkbox;
