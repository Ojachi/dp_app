/**
 * Componente de radio buttons compatible con Bootstrap 5
 */
import React from 'react';

const Radio = ({
  name,
  options = [],
  label,
  value,
  onChange,
  disabled = false,
  error,
  className = '',
  ...props
}) => {
  
  const handleChange = (optionValue) => {
    if (onChange) {
      onChange({ target: { value: optionValue, name } });
    }
  };

  return (
    <div className={`mb-3 ${className}`}>
      {label && (
        <label className="form-label">
          {label}
        </label>
      )}
      
      <div>
        {options.map((option, index) => {
          const optionValue = option.value !== undefined ? option.value : option;
          const optionLabel = option.label !== undefined ? option.label : option;
          const radioId = `${name}-${index}`;
          
          return (
            <div key={optionValue} className="form-check">
              <input
                className={`form-check-input ${error ? 'is-invalid' : ''}`}
                type="radio"
                name={name}
                id={radioId}
                value={optionValue}
                checked={value === optionValue}
                onChange={() => handleChange(optionValue)}
                disabled={disabled}
                {...props}
              />
              <label className="form-check-label" htmlFor={radioId}>
                {optionLabel}
              </label>
            </div>
          );
        })}
      </div>
      
      {error && (
        <div className="invalid-feedback d-block">
          {error}
        </div>
      )}
    </div>
  );
};

export { Radio };
export default Radio;
