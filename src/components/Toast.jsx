/**
 * Sistema de notificaciones Toast
 */
import React, { createContext, useContext, useState, useCallback } from 'react';

// Contexto para el sistema de toasts
const ToastContext = createContext();

// Hook para usar el sistema de toasts
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast debe ser usado dentro de ToastProvider');
  }
  return context;
};

// Componente individual Toast
const Toast = ({ 
  id, 
  type = 'info', 
  title, 
  message, 
  duration = 5000, 
  onClose,
  autoClose = true,
  showCloseButton = true,
  className = '' 
}) => {
  const [isVisible, setIsVisible] = React.useState(true);
  const [isLeaving, setIsLeaving] = React.useState(false);

  const getVariantClasses = () => {
    const variants = {
      success: 'bg-success text-white',
      error: 'bg-danger text-white',
      warning: 'bg-warning text-dark',
      info: 'bg-primary text-white',
      light: 'bg-light text-dark border'
    };
    return variants[type] || variants.info;
  };

  const getIcon = () => {
    const icons = {
      success: 'fas fa-check-circle',
      error: 'fas fa-times-circle',
      warning: 'fas fa-exclamation-triangle',
      info: 'fas fa-info-circle'
    };
    return icons[type];
  };

  const handleClose = useCallback(() => {
    setIsLeaving(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose?.(id);
    }, 300);
  }, [id, onClose]);

  React.useEffect(() => {
    if (autoClose && duration > 0) {
      const timer = setTimeout(handleClose, duration);
      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, handleClose]);

  if (!isVisible) return null;

  return (
    <div 
      className={`
        toast align-items-center border-0 show
        ${getVariantClasses()}
        ${isLeaving ? 'toast-leaving' : 'toast-entering'}
        ${className}
      `}
      role="alert"
      style={{
        minWidth: '300px',
        transition: 'all 0.3s ease-in-out'
      }}
    >
      <div className="d-flex">
        <div className="toast-body d-flex align-items-start">
          {getIcon() && (
            <i className={`${getIcon()} me-2 mt-1`}></i>
          )}
          <div className="flex-grow-1">
            {title && (
              <div className="fw-bold mb-1">{title}</div>
            )}
            <div className={title ? 'small' : ''}>{message}</div>
          </div>
        </div>
        
        {showCloseButton && (
          <button 
            type="button" 
            className="btn-close me-2 m-auto"
            onClick={handleClose}
            aria-label="Close"
            style={{ filter: type === 'warning' || type === 'light' ? 'none' : 'invert(1)' }}
          />
        )}
      </div>
      
      {duration > 0 && autoClose && (
        <div 
          className="toast-progress"
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            height: '3px',
            backgroundColor: 'rgba(255, 255, 255, 0.3)',
            animation: `toast-progress ${duration}ms linear forwards`
          }}
        />
      )}
    </div>
  );
};

// Contenedor de toasts
const ToastContainer = ({ toasts, onRemove, position = 'top-right' }) => {
  const getPositionClasses = () => {
    const positions = {
      'top-right': 'toast-container position-fixed top-0 end-0 p-3',
      'top-left': 'toast-container position-fixed top-0 start-0 p-3',
      'bottom-right': 'toast-container position-fixed bottom-0 end-0 p-3',
      'bottom-left': 'toast-container position-fixed bottom-0 start-0 p-3',
      'top-center': 'toast-container position-fixed top-0 start-50 translate-middle-x p-3',
      'bottom-center': 'toast-container position-fixed bottom-0 start-50 translate-middle-x p-3'
    };
    return positions[position] || positions['top-right'];
  };

  return (
    <div 
      className={getPositionClasses()}
      style={{ zIndex: 9999 }}
    >
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          {...toast}
          onClose={onRemove}
          className="mb-2"
        />
      ))}
    </div>
  );
};

// Provider del contexto de toasts
export const ToastProvider = ({ children, position = 'top-right', maxToasts = 5 }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toast) => {
    const id = Date.now() + Math.random();
    const newToast = {
      id,
      type: 'info',
      autoClose: true,
      showCloseButton: true,
      duration: 5000,
      ...toast
    };

    setToasts((prevToasts) => {
      const updatedToasts = [...prevToasts, newToast];
      // Limitar el número de toasts mostrados
      return updatedToasts.slice(-maxToasts);
    });

    return id;
  }, [maxToasts]);

  const removeToast = useCallback((id) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Métodos de conveniencia
  const toast = React.useMemo(() => ({
    success: (message, options = {}) => addToast({ type: 'success', message, ...options }),
    error: (message, options = {}) => addToast({ type: 'error', message, duration: 8000, ...options }),
    warning: (message, options = {}) => addToast({ type: 'warning', message, duration: 6000, ...options }),
    info: (message, options = {}) => addToast({ type: 'info', message, ...options }),
    custom: (options) => addToast(options)
  }), [addToast]);

  const contextValue = {
    toasts,
    addToast,
    removeToast,
    clearAllToasts,
    toast
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastContainer 
        toasts={toasts} 
        onRemove={removeToast} 
        position={position} 
      />
      <style>
        {`
          @keyframes toast-progress {
            from { width: 100%; }
            to { width: 0%; }
          }
          
          .toast-entering {
            animation: slideInRight 0.3s ease-out;
          }
          
          .toast-leaving {
            animation: slideOutRight 0.3s ease-in;
          }
          
          @keyframes slideInRight {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
          
          @keyframes slideOutRight {
            from {
              transform: translateX(0);
              opacity: 1;
            }
            to {
              transform: translateX(100%);
              opacity: 0;
            }
          }
        `}
      </style>
    </ToastContext.Provider>
  );
};

export default ToastProvider;