/**
 * Componente de botón compatible con Bootstrap 5
 */
import React from 'react';

const Button = ({ 
  variant = 'primary',
  size = 'md',
  type = 'button',
  onClick,
  disabled = false,
  loading = false,
  outline = false,
  block = false,
  children,
  className = '',
  ...props 
}) => {
  
  const sizeClasses = {
    sm: 'btn-sm',
    md: '',
    lg: 'btn-lg'
  };

  const baseClass = outline ? `btn-outline-${variant}` : `btn-${variant}`;
  
  const classes = [
    'btn',
    baseClass,
    sizeClasses[size],
    block ? 'd-block w-100' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span 
          className="spinner-border spinner-border-sm me-2" 
          role="status" 
          aria-hidden="true"
        >
        </span>
      )}
      {children}
    </button>
  );
};

export { Button };
export default Button;
