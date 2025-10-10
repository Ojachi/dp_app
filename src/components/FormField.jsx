/**
 * Componente FormField para formularios con validación integrada
 */
import React, { forwardRef } from 'react';
import Input from './Input';
import Select from './Select';
import DatePicker from './DatePicker';
import Checkbox from './Checkbox';
import Radio from './Radio';

const FormField = forwardRef(({
  type = 'text',
  name,
  label,
  value,
  onChange,
  onBlur,
  error,
  touched,
  required = false,
  disabled = false,
  loading = false,
  placeholder,
  options = [],
  multiple = false,
  description,
  tooltip,
  size = 'md',
  className = '',
  labelClassName = '',
  inputClassName = '',
  errorClassName = '',
  layout = 'vertical', // vertical, horizontal, inline
  colProps = {},
  validation = {},
  formatValue,
  parseValue,
  children,
  ...props
}, ref) => {
  
  // Validación en tiempo real
  const validateField = (val) => {
    const { min, max, pattern, custom, minLength, maxLength } = validation;
    
    if (required && (!val || val === '')) {
      return 'Este campo es requerido';
    }
    
    if (val) {
      if (minLength && val.length < minLength) {
        return `Mínimo ${minLength} caracteres`;
      }
      if (maxLength && val.length > maxLength) {
        return `Máximo ${maxLength} caracteres`;
      }
      if (min && parseFloat(val) < min) {
        return `Valor mínimo: ${min}`;
      }
      if (max && parseFloat(val) < max) {
        return `Valor máximo: ${max}`;
      }
      if (pattern && !pattern.test(val)) {
        return 'Formato inválido';
      }
      if (custom && typeof custom === 'function') {
        return custom(val);
      }
    }
    
    return null;
  };

  const handleChange = (e) => {
    let newValue = e.target ? e.target.value : e;
    
    if (parseValue) {
      newValue = parseValue(newValue);
    }
    
    onChange?.(e.target ? { ...e, target: { ...e.target, value: newValue } } : newValue);
  };

  const handleBlur = (e) => {
    const fieldError = validateField(value);
    onBlur?.(e, fieldError);
  };

  const displayValue = formatValue ? formatValue(value) : value;
  const fieldError = error || (touched ? validateField(value) : null);
  const hasError = Boolean(fieldError);

  const renderLabel = () => {
    if (!label) return null;
    
    return (
      <label 
        htmlFor={name} 
        className={`form-label ${required ? 'required' : ''} ${labelClassName}`}
      >
        {label}
        {required && <span className="text-danger ms-1">*</span>}
        {tooltip && (
          <i 
            className="fas fa-info-circle ms-2 text-muted cursor-help" 
            title={tooltip}
            data-bs-toggle="tooltip"
          />
        )}
      </label>
    );
  };

  const renderDescription = () => {
    if (!description) return null;
    
    return (
      <small className="form-text text-muted mt-1">
        {description}
      </small>
    );
  };

  const renderError = () => {
    if (!fieldError) return null;
    
    return (
      <div className={`invalid-feedback d-block ${errorClassName}`}>
        <i className="fas fa-exclamation-circle me-1" />
        {fieldError}
      </div>
    );
  };

  const renderInput = () => {
    const commonProps = {
      ref,
      name,
      id: name,
      value: displayValue || '',
      onChange: handleChange,
      onBlur: handleBlur,
      disabled: disabled || loading,
      placeholder,
      className: `${hasError ? 'is-invalid' : ''} ${inputClassName}`,
      size,
      ...props
    };

    switch (type) {
      case 'select':
        return (
          <Select
            {...commonProps}
            options={options}
            multiple={multiple}
          />
        );

      case 'date':
      case 'datetime':
      case 'time':
        return (
          <DatePicker
            {...commonProps}
            type={type}
          />
        );

      case 'checkbox':
        return (
          <Checkbox
            {...commonProps}
            checked={Boolean(value)}
            onChange={(e) => handleChange(e.target.checked)}
          />
        );

      case 'radio':
        return (
          <div className="form-check-group">
            {options.map((option) => (
              <Radio
                key={option.value}
                name={name}
                value={option.value}
                checked={value === option.value}
                onChange={handleChange}
                disabled={disabled || loading}
                size={size}
              >
                {option.label}
              </Radio>
            ))}
          </div>
        );

      case 'textarea':
        return (
          <textarea
            {...commonProps}
            className={`form-control ${hasError ? 'is-invalid' : ''} ${inputClassName}`}
            rows={props.rows || 3}
          />
        );

      case 'number':
        return (
          <Input
            {...commonProps}
            type="number"
            min={validation.min}
            max={validation.max}
            step={props.step}
          />
        );

      case 'email':
        return (
          <Input
            {...commonProps}
            type="email"
          />
        );

      case 'password':
        return (
          <Input
            {...commonProps}
            type="password"
          />
        );

      case 'tel':
        return (
          <Input
            {...commonProps}
            type="tel"
          />
        );

      case 'url':
        return (
          <Input
            {...commonProps}
            type="url"
          />
        );

      case 'file':
        return (
          <input
            {...commonProps}
            type="file"
            className={`form-control ${hasError ? 'is-invalid' : ''} ${inputClassName}`}
            accept={props.accept}
            multiple={multiple}
          />
        );

      case 'custom':
        return children;

      default:
        return (
          <Input
            {...commonProps}
            type={type}
          />
        );
    }
  };

  const containerClasses = [
    layout === 'horizontal' ? 'row' : '',
    layout === 'inline' ? 'd-inline-flex align-items-center' : '',
    className
  ].filter(Boolean).join(' ');

  const labelColClasses = layout === 'horizontal' ? 'col-sm-3 col-form-label' : '';
  const inputColClasses = layout === 'horizontal' ? 'col-sm-9' : '';

  if (layout === 'horizontal') {
    return (
      <div className={`mb-3 ${containerClasses}`}>
        <div className={labelColClasses}>
          {renderLabel()}
        </div>
        <div className={inputColClasses}>
          {renderInput()}
          {renderError()}
          {renderDescription()}
        </div>
      </div>
    );
  }

  if (layout === 'inline') {
    return (
      <div className={containerClasses}>
        {renderLabel()}
        <div className="ms-2">
          {renderInput()}
        </div>
        {fieldError && (
          <small className="text-danger ms-2">{fieldError}</small>
        )}
      </div>
    );
  }

  return (
    <div className={`mb-3 ${containerClasses}`}>
      {renderLabel()}
      {renderInput()}
      {renderError()}
      {renderDescription()}
    </div>
  );
});

FormField.displayName = 'FormField';

// Hook para manejar formularios
export const useFormField = (initialValue = '', validation = {}) => {
  const [value, setValue] = React.useState(initialValue);
  const [touched, setTouched] = React.useState(false);
  const [error, setError] = React.useState(null);

  const handleChange = React.useCallback((e) => {
    const newValue = e.target ? e.target.value : e;
    setValue(newValue);
    
    if (touched) {
      // Validar en tiempo real solo si ya fue tocado
      const fieldError = validateField(newValue, validation);
      setError(fieldError);
    }
  }, [touched, validation]);

  const handleBlur = React.useCallback(() => {
    setTouched(true);
    const fieldError = validateField(value, validation);
    setError(fieldError);
  }, [value, validation]);

  const reset = React.useCallback((newValue = initialValue) => {
    setValue(newValue);
    setTouched(false);
    setError(null);
  }, [initialValue]);

  const validate = React.useCallback(() => {
    const fieldError = validateField(value, validation);
    setError(fieldError);
    setTouched(true);
    return !fieldError;
  }, [value, validation]);

  return {
    value,
    error,
    touched,
    onChange: handleChange,
    onBlur: handleBlur,
    reset,
    validate,
    isValid: !error && touched,
    isDirty: value !== initialValue
  };
};

// Función de validación reutilizable
const validateField = (value, validation = {}) => {
  const { required, min, max, pattern, custom, minLength, maxLength } = validation;
  
  if (required && (!value || value === '')) {
    return 'Este campo es requerido';
  }
  
  if (value) {
    if (minLength && value.length < minLength) {
      return `Mínimo ${minLength} caracteres`;
    }
    if (maxLength && value.length > maxLength) {
      return `Máximo ${maxLength} caracteres`;
    }
    if (min && parseFloat(value) < min) {
      return `Valor mínimo: ${min}`;
    }
    if (max && parseFloat(value) > max) {
      return `Valor máximo: ${max}`;
    }
    if (pattern && !pattern.test(value)) {
      return 'Formato inválido';
    }
    if (custom && typeof custom === 'function') {
      return custom(value);
    }
  }
  
  return null;
};

export { FormField };
export default FormField;