/**
 * Componente ConfirmDialog para confirmaciones de acciones
 */
import React from 'react';
import Modal from './Modal';
import Button from './Button';

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirmar acción',
  message = '¿Estás seguro de que quieres realizar esta acción?',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger',
  size = 'sm',
  loading = false,
  icon = null,
  details = null,
  className = '',
  ...props
}) => {
  const handleConfirm = async () => {
    if (onConfirm) {
      await onConfirm();
    }
  };

  const getIcon = () => {
    if (icon) return icon;
    
    const icons = {
      danger: (
        <i className="fas fa-exclamation-triangle text-danger" style={{ fontSize: '2rem' }}></i>
      ),
      warning: (
        <i className="fas fa-exclamation-circle text-warning" style={{ fontSize: '2rem' }}></i>
      ),
      info: (
        <i className="fas fa-info-circle text-info" style={{ fontSize: '2rem' }}></i>
      ),
      success: (
        <i className="fas fa-check-circle text-success" style={{ fontSize: '2rem' }}></i>
      ),
      delete: (
        <i className="fas fa-trash text-danger" style={{ fontSize: '2rem' }}></i>
      )
    };

    return icons[variant] || icons.danger;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size={size}
      className={className}
      {...props}
    >
      <div className="text-center py-3">
        {getIcon()}
        
        <div className="mt-3">
          <p className="mb-2">{message}</p>
          
          {details && (
            <div className="mt-3 p-3 bg-light rounded">
              {typeof details === 'string' ? (
                <small className="text-muted">{details}</small>
              ) : (
                details
              )}
            </div>
          )}
        </div>

        <div className="d-flex justify-content-center gap-3 mt-4">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </Button>
          
          <Button
            variant={variant}
            onClick={handleConfirm}
            loading={loading}
            disabled={loading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

// Variantes específicas para casos comunes
export const DeleteConfirmDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  itemName,
  loading = false 
}) => (
  <ConfirmDialog
    isOpen={isOpen}
    onClose={onClose}
    onConfirm={onConfirm}
    title="Eliminar elemento"
    message={`¿Estás seguro de que quieres eliminar "${itemName}"?`}
    details="Esta acción no se puede deshacer."
    confirmText="Eliminar"
    variant="delete"
    loading={loading}
  />
);

export const LogoutConfirmDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm,
  loading = false 
}) => (
  <ConfirmDialog
    isOpen={isOpen}
    onClose={onClose}
    onConfirm={onConfirm}
    title="Cerrar sesión"
    message="¿Estás seguro de que quieres cerrar sesión?"
    details="Tendrás que volver a iniciar sesión para acceder al sistema."
    confirmText="Cerrar sesión"
    cancelText="Cancelar"
    variant="warning"
    loading={loading}
  />
);

export const SaveConfirmDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm,
  hasUnsavedChanges = true,
  loading = false 
}) => (
  <ConfirmDialog
    isOpen={isOpen}
    onClose={onClose}
    onConfirm={onConfirm}
    title="Guardar cambios"
    message={hasUnsavedChanges ? "Tienes cambios sin guardar. ¿Quieres guardarlos?" : "¿Estás seguro de que quieres guardar los cambios?"}
    confirmText="Guardar"
    variant="success"
    loading={loading}
  />
);

export const DiscardChangesDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm,
  loading = false 
}) => (
  <ConfirmDialog
    isOpen={isOpen}
    onClose={onClose}
    onConfirm={onConfirm}
    title="Descartar cambios"
    message="¿Estás seguro de que quieres descartar los cambios?"
    details="Todos los cambios no guardados se perderán."
    confirmText="Descartar"
    variant="warning"
    loading={loading}
  />
);

export { ConfirmDialog };
export default ConfirmDialog;