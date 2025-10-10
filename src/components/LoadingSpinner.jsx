/**
 * Componente LoadingSpinner con múltiples variantes y tamaños
 */
import React from 'react';

const LoadingSpinner = ({
  size = 'md',
  variant = 'primary',
  type = 'border',
  message = 'Cargando...',
  centered = true,
  overlay = false,
  className = '',
  style = {},
  children
}) => {
  const sizeClasses = {
    xs: 'spinner-border-sm',
    sm: 'spinner-border-sm',
    md: '',
    lg: '',
    xl: '',
    // Compatibilidad con prop anterior
    small: 'spinner-border-sm',
    large: ''
  };

  const sizeStyles = {
    xs: { width: '1rem', height: '1rem' },
    sm: { width: '1.5rem', height: '1.5rem' },
    md: { width: '2rem', height: '2rem' },
    lg: { width: '3rem', height: '3rem' },
    xl: { width: '4rem', height: '4rem' },
    // Compatibilidad con prop anterior
    small: { width: '1.5rem', height: '1.5rem' },
    large: { width: '3rem', height: '3rem' }
  };

  const spinnerClass = type === 'grow' ? 'spinner-grow' : 'spinner-border';
  const textClass = `text-${variant}`;
  
  const spinnerClasses = [
    spinnerClass,
    textClass,
    sizeClasses[size] || '',
    className
  ].filter(Boolean).join(' ');

  const spinnerStyle = {
    ...sizeStyles[size],
    ...style
  };

  const SpinnerElement = (
    <div className={spinnerClasses} role="status" style={spinnerStyle}>
      <span className="visually-hidden">Cargando...</span>
    </div>
  );

  const ContentElement = () => (
    <div className={centered ? 'd-flex flex-column align-items-center justify-content-center py-5' : ''}>
      {SpinnerElement}
      {message && (
        <div className={`mt-2 ${size === 'large' || size === 'lg' || size === 'xl' ? 'mt-3' : 'mt-2'}`}>
          {typeof message === 'string' ? (
            <p className={`text-muted mb-0 ${size === 'large' || size === 'lg' || size === 'xl' ? '' : 'small'}`}>
              {message}
            </p>
          ) : (
            message
          )}
        </div>
      )}
      {children}
    </div>
  );

  if (overlay) {
    return (
      <div 
        className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
        style={{ 
          backgroundColor: 'rgba(0, 0, 0, 0.5)', 
          zIndex: 9999,
          backdropFilter: 'blur(2px)'
        }}
      >
        <div className="bg-white rounded p-4 shadow">
          <ContentElement />
        </div>
      </div>
    );
  }

  return <ContentElement />;
};

// Variantes específicas para casos comunes
export const PageLoader = ({ message = "Cargando página..." }) => (
  <div className="d-flex align-items-center justify-content-center min-vh-100">
    <LoadingSpinner size="lg" message={message} variant="primary" />
  </div>
);

export const ButtonLoader = ({ size = "sm", variant = "light" }) => (
  <LoadingSpinner size={size} variant={variant} centered={false} />
);

export const InlineLoader = ({ message = "Cargando...", size = "sm" }) => (
  <div className="d-inline-flex align-items-center">
    <LoadingSpinner size={size} centered={false} className="me-2" />
    <span>{message}</span>
  </div>
);

export const CardLoader = ({ message = "Cargando datos..." }) => (
  <div className="card">
    <div className="card-body text-center py-5">
      <LoadingSpinner size="lg" message={message} />
    </div>
  </div>
);

export const OverlayLoader = ({ message = "Procesando..." }) => (
  <LoadingSpinner overlay message={message} size="lg" />
);

export { LoadingSpinner };
export default LoadingSpinner;