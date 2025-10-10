/**
 * Modal component compatible with Bootstrap 5
 */
import React, { useEffect } from 'react';
import { Button } from './Button';

const Modal = ({
  show = false,
  onHide,
  title,
  children,
  size = 'lg',
  centered = true,
  backdrop = true,
  keyboard = true,
  footer,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  onConfirm,
  onCancel,
  confirmVariant = 'primary',
  cancelVariant = 'secondary',
  loading = false,
  staticBackdrop = false,
  ...props
}) => {
  
  useEffect(() => {
    // Controlar el scroll del body cuando el modal está abierto
    if (show) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    // Cleanup al desmontar
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [show]);

  if (!show) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !staticBackdrop && backdrop) {
      onHide?.();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape' && keyboard && !staticBackdrop) {
      onHide?.();
    }
  };

  const sizeClasses = {
    sm: 'modal-sm',
    md: '',
    lg: 'modal-lg',
    xl: 'modal-xl'
  };

  return (
    <div
      className="modal fade show"
      style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
      tabIndex="-1"
      role="dialog"
      aria-labelledby="modalTitle"
      aria-hidden="false"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      {...props}
    >
      <div 
        className={`modal-dialog ${sizeClasses[size]} ${centered ? 'modal-dialog-centered' : ''}`}
        role="document"
      >
        <div className="modal-content">
          {/* Header */}
          {title && (
            <div className="modal-header">
              <h5 className="modal-title" id="modalTitle">
                {title}
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={onHide}
                disabled={loading}
                aria-label="Close"
              ></button>
            </div>
          )}
          
          {/* Body */}
          <div className="modal-body">
            {children}
          </div>
          
          {/* Footer */}
          {(footer || onConfirm || onCancel) && (
            <div className="modal-footer">
              {footer ? (
                footer
              ) : (
                <div className="d-flex gap-2">
                  {onCancel && (
                    <Button
                      variant={cancelVariant}
                      onClick={onCancel}
                      disabled={loading}
                    >
                      {cancelText}
                    </Button>
                  )}
                  {onConfirm && (
                    <Button
                      variant={confirmVariant}
                      onClick={onConfirm}
                      loading={loading}
                    >
                      {confirmText}
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;
