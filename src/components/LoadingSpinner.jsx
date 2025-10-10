/**
 * Componente de spinner de carga reutilizable
 */
import React from 'react';

const LoadingSpinner = ({ message = 'Cargando...', size = 'large' }) => {
  const spinnerSize = size === 'large' ? 'spinner-border-lg' : size === 'small' ? 'spinner-border-sm' : '';

  return (
    <div className="d-flex flex-column justify-content-center align-items-center py-5">
      <div className={`spinner-border text-primary ${spinnerSize}`} role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      {message && (
        <p className="text-muted mt-3 mb-0">{message}</p>
      )}
    </div>
  );
};

export default LoadingSpinner;