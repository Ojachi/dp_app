/**
 * Modal component compatible with Bootstrap 5 - Enhanced version
 */
import React, { useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Button from './Button';

const Modal = ({
  isOpen = false, // Cambiado para consistencia con otros componentes
  show = false, // Mantener compatibilidad hacia atrás
  onClose,
  onHide, // Mantener compatibilidad hacia atrás
  title,
  subtitle,
  icon,
  children,
  size = 'lg',
  centered = true,
  backdrop = true,
  keyboard = true,
  scrollable = false,
  fullscreen = false,
  animation = true,
  footer,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  onConfirm,
  onCancel,
  confirmVariant = 'primary',
  cancelVariant = 'secondary',
  loading = false,
  staticBackdrop = false,
  className = '',
  headerClassName = '',
  bodyClassName = '',
  footerClassName = '',
  maxHeight,
  autoFocus = true,
  preventClose = false,
  zIndex = 1055,
  ...props
}) => {
  const modalRef = useRef(null);
  const isVisible = isOpen || show; // Compatibilidad
  const handleClose = onClose || onHide; // Compatibilidad

  // Focus management
  useEffect(() => {
    if (isVisible && autoFocus && modalRef.current) {
      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusableElements.length > 0) {
        focusableElements[0].focus();
      }
    }
  }, [isVisible, autoFocus]);

  // Body scroll management
  useEffect(() => {
    if (isVisible) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      document.body.classList.add('modal-open');
      
      return () => {
        document.body.style.overflow = originalStyle;
        document.body.classList.remove('modal-open');
      };
    }
  }, [isVisible]);

  // Keyboard event handler
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape' && keyboard && !staticBackdrop && !preventClose) {
      handleClose?.();
    }
  }, [keyboard, staticBackdrop, preventClose, handleClose]);

  // Backdrop click handler
  const handleBackdropClick = useCallback((e) => {
    if (e.target === e.currentTarget && !staticBackdrop && backdrop && !preventClose) {
      handleClose?.();
    }
  }, [staticBackdrop, backdrop, preventClose, handleClose]);

  // Close button handler
  const handleCloseClick = useCallback(() => {
    if (!preventClose) {
      handleClose?.();
    }
  }, [preventClose, handleClose]);

  if (!isVisible) return null;

  const getSizeClass = () => {
    if (fullscreen) {
      if (typeof fullscreen === 'string') {
        return `modal-fullscreen-${fullscreen}`;
      }
      return 'modal-fullscreen';
    }
    
    const sizes = {
      xs: 'modal-sm',
      sm: 'modal-sm',
      md: '',
      lg: 'modal-lg',
      xl: 'modal-xl'
    };
    return sizes[size] || sizes.lg;
  };

  const modalClasses = [
    'modal',
    animation ? 'fade show' : 'show',
    className
  ].filter(Boolean).join(' ');

  const dialogClasses = [
    'modal-dialog',
    getSizeClass(),
    centered ? 'modal-dialog-centered' : '',
    scrollable ? 'modal-dialog-scrollable' : ''
  ].filter(Boolean).join(' ');

  const modalContent = (
    <div
      className={modalClasses}
      style={{ 
        display: 'block', 
        backgroundColor: backdrop ? 'rgba(0,0,0,0.5)' : 'transparent',
        zIndex
      }}
      tabIndex="-1"
      role="dialog"
      aria-labelledby={title ? "modalTitle" : undefined}
      aria-hidden="false"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      ref={modalRef}
      {...props}
    >
      <div className={dialogClasses} role="document">
        <div className="modal-content" style={maxHeight ? { maxHeight } : {}}>
          
          {/* Header */}
          {(title || icon) && (
            <div className={`modal-header ${headerClassName}`}>
              <div className="d-flex align-items-center">
                {icon && (
                  <div className="me-3">
                    {typeof icon === 'string' ? (
                      <i className={`${icon} fs-4`}></i>
                    ) : (
                      icon
                    )}
                  </div>
                )}
                
                <div>
                  {title && (
                    <h5 className="modal-title mb-0" id="modalTitle">
                      {title}
                    </h5>
                  )}
                  {subtitle && (
                    <small className="text-muted">{subtitle}</small>
                  )}
                </div>
              </div>
              
              <button
                type="button"
                className="btn-close"
                onClick={handleCloseClick}
                disabled={loading || preventClose}
                aria-label="Cerrar"
              />
            </div>
          )}
          
          {/* Body */}
          <div className={`modal-body ${bodyClassName}`}>
            {children}
          </div>
          
          {/* Footer */}
          {(footer || onConfirm || onCancel) && (
            <div className={`modal-footer ${footerClassName}`}>
              {footer ? (
                footer
              ) : (
                <div className="d-flex gap-2 justify-content-end">
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
                      disabled={preventClose}
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

  // Render using portal for better z-index management
  return createPortal(modalContent, document.body);
};

// Hook personalizado para manejar modales
export const useModal = (initialState = false) => {
  const [isOpen, setIsOpen] = React.useState(initialState);
  
  const openModal = useCallback(() => setIsOpen(true), []);
  const closeModal = useCallback(() => setIsOpen(false), []);
  const toggleModal = useCallback(() => setIsOpen(prev => !prev), []);
  
  return {
    isOpen,
    openModal,
    closeModal,
    toggleModal,
    modalProps: {
      isOpen,
      onClose: closeModal
    }
  };
};

export { Modal };
export default Modal;
