/**
 * Componente EmptyState para mostrar cuando no hay contenido
 */
import React from 'react';
import Button from './Button';

const EmptyState = ({
  icon = 'fas fa-inbox',
  title = 'No hay datos disponibles',
  description,
  actionText,
  onAction,
  variant = 'light',
  size = 'md',
  illustration = null,
  className = '',
  children,
  ...props
}) => {
  const getSizeClasses = () => {
    const sizes = {
      sm: 'py-4',
      md: 'py-5',
      lg: 'py-6'
    };
    return sizes[size] || sizes.md;
  };

  const getIconSize = () => {
    const sizes = {
      sm: 'fs-1',
      md: 'fs-huge',
      lg: 'fs-huge'
    };
    return sizes[size] || sizes.md;
  };

  const containerClasses = [
    'text-center',
    getSizeClasses(),
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses} {...props}>
      {/* Ilustración o Ícono */}
      <div className="mb-4">
        {illustration ? (
          illustration
        ) : (
          <i 
            className={`${icon} ${getIconSize()} text-muted opacity-50`}
            style={{ fontSize: size === 'lg' ? '5rem' : size === 'md' ? '4rem' : '3rem' }}
          />
        )}
      </div>

      {/* Título */}
      <h4 className="text-muted mb-3">
        {title}
      </h4>

      {/* Descripción */}
      {description && (
        <p className="text-muted mb-4 mx-auto" style={{ maxWidth: '400px' }}>
          {description}
        </p>
      )}

      {/* Contenido personalizado */}
      {children}

      {/* Acción */}
      {actionText && onAction && (
        <div className="mt-4">
          <Button 
            variant={variant === 'light' ? 'primary' : variant}
            onClick={onAction}
          >
            {actionText}
          </Button>
        </div>
      )}

      {/* Estilos personalizados */}
      <style jsx>{`
        .fs-huge {
          font-size: 4rem;
        }
      `}</style>
    </div>
  );
};

// Variantes específicas para casos comunes
export const NoDataFound = ({ 
  searchTerm,
  onClearSearch,
  onCreateNew,
  createText = "Crear nuevo"
}) => (
  <EmptyState
    icon="fas fa-search"
    title={searchTerm ? "No se encontraron resultados" : "No hay datos disponibles"}
    description={
      searchTerm 
        ? `No se encontraron elementos que coincidan con "${searchTerm}"`
        : "Aún no hay elementos para mostrar"
    }
  >
    <div className="d-flex justify-content-center gap-2 mt-4">
      {searchTerm && onClearSearch && (
        <Button variant="outline-secondary" onClick={onClearSearch}>
          Limpiar búsqueda
        </Button>
      )}
      {onCreateNew && (
        <Button variant="primary" onClick={onCreateNew}>
          {createText}
        </Button>
      )}
    </div>
  </EmptyState>
);

export const NoPermissions = ({ 
  resource = "este recurso",
  contactAdmin = true 
}) => (
  <EmptyState
    icon="fas fa-lock"
    title="Sin permisos de acceso"
    description={`No tienes permisos para acceder a ${resource}. ${contactAdmin ? 'Contacta al administrador si necesitas acceso.' : ''}`}
    variant="warning"
  />
);

export const NetworkError = ({ 
  onRetry,
  retryText = "Reintentar"
}) => (
  <EmptyState
    icon="fas fa-wifi"
    title="Error de conexión"
    description="No se pudo cargar la información. Verifica tu conexión a internet."
    actionText={retryText}
    onAction={onRetry}
    variant="danger"
  />
);

export const MaintenanceMode = ({ 
  estimatedTime,
  showContact = true 
}) => (
  <EmptyState
    icon="fas fa-tools"
    title="Mantenimiento en progreso"
    description={`El sistema está temporalmente fuera de servicio por mantenimiento. ${estimatedTime ? `Tiempo estimado: ${estimatedTime}` : ''} ${showContact ? 'Disculpa las molestias.' : ''}`}
    variant="info"
  />
);

export const ComingSoon = ({ 
  feature = "Esta funcionalidad",
  notifyMe
}) => (
  <EmptyState
    icon="fas fa-rocket"
    title="Próximamente"
    description={`${feature} estará disponible pronto. Estamos trabajando para traerte las mejores funcionalidades.`}
    actionText={notifyMe ? "Notificarme" : undefined}
    onAction={notifyMe}
    variant="info"
  />
);

export const ErrorBoundaryFallback = ({ 
  onReset,
  resetText = "Recargar página"
}) => (
  <EmptyState
    icon="fas fa-exclamation-triangle"
    title="¡Ups! Algo salió mal"
    description="Ha ocurrido un error inesperado. Intenta recargar la página o contacta al soporte técnico si el problema persiste."
    actionText={resetText}
    onAction={onReset}
    variant="danger"
  />
);

export const FileTooLarge = ({ 
  maxSize = "10MB",
  onSelectNew 
}) => (
  <EmptyState
    icon="fas fa-file-upload"
    title="Archivo demasiado grande"
    description={`El archivo seleccionado excede el tamaño máximo permitido de ${maxSize}. Selecciona un archivo más pequeño.`}
    actionText="Seleccionar otro archivo"
    onAction={onSelectNew}
    variant="warning"
  />
);

export { EmptyState };
export default EmptyState;